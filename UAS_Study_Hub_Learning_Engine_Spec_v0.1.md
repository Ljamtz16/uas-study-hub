# UAS Study Hub — Learning Engine Specification v0.1

**Estado:** Ready for implementation planning  
**Fecha:** 2026-09-03  
**Decisión principal:** DEC-20260903-001  
**Ámbito:** Brain Specification / Domain Layer  
**Versión objetivo de producto:** V0.1 Study Core, compatible con evolución V0.2+

---

## 0. Propósito

Definir cómo representa UAS Study Hub el aprendizaje antes de ampliar la aplicación.

Esta especificación no reemplaza la Master Specification v2. La complementa.

La Master Specification continúa definiendo:

- visión del producto;
- UX general;
- stack;
- arquitectura;
- roadmap;
- Golden Course;
- criterios de aceptación.

Este documento define:

1. Learning Domain Model.
2. TypeScript Data Contracts v0.1.
3. Mastery Engine v0.1.
4. Recommendation Engine v0.1.
5. Evidence model.
6. Golden Topic schema.

---

# 1. Learning Domain Model

## 1.1 Estructura académica canónica

```text
Course
└── Block
    └── Topic
```

Se conserva sin cambios.

## 1.2 Capa de aprendizaje

```text
Topic
├── LearningObjective
├── Concept
├── Skill
└── LearningEvidence
       ↓
    Mastery
       ↓
Recommendation
       ↓
Next Study Action
```

## 1.3 Definiciones

### Topic

Unidad principal de contenido y navegación.

Responde:

> ¿Qué estoy estudiando?

### Concept

Unidad semántica de conocimiento reutilizable.

Responde:

> ¿Qué debo comprender?

Un Concept puede relacionarse con varios Topics, pero posee un Topic primario para simplificar V0.x.

### Skill

Capacidad observable que depende de uno o más conceptos.

Responde:

> ¿Qué debo ser capaz de hacer?

### LearningObjective

Resultado verificable asociado a un Topic.

Relaciona contenido, conceptos y skills.

### LearningEvidence

Registro inmutable de una interacción que aporta evidencia de aprendizaje.

Ejemplos:

- completar estudio;
- responder active recall;
- realizar un quiz;
- realizar un repaso;
- completar una aplicación/ejercicio.

### Mastery

Estado derivado a partir de evidencia.

No debe editarse manualmente como fuente primaria.

### Recommendation

Acción sugerida por un motor determinista y explicable.

---

# 2. Invariantes del sistema

1. `Course`, `Block`, `Topic`, `Concept`, `Skill` y `LearningObjective` usan IDs estables.
2. El título visible puede cambiar sin cambiar el ID.
3. El contenido académico canónico vive en Markdown/MDX.
4. Evidencia, notas y progreso son datos personales locales.
5. Leer un Topic no equivale a dominarlo.
6. `MasteryScore` siempre puede explicarse mediante su breakdown.
7. `Next Study Action` siempre muestra un motivo.
8. El Learning Engine no depende de IA.
9. El Learning Engine no depende de Supabase.
10. V0.1 debe funcionar offline.

---

# 3. Evidencia de aprendizaje

## 3.1 Tipos

| Evidence type | Significado | Capacidad máxima en Mastery |
|---|---|---:|
| `study` | El usuario trabajó el contenido | 10 puntos |
| `recall` | Recuperación sin mirar | 20 puntos |
| `quiz` | Práctica/evaluación | 35 puntos |
| `review` | Repaso espaciado | 25 puntos |
| `application` | Ejercicio, lab o aplicación | 10 puntos |

Total máximo: **100 puntos**.

## 3.2 Principio clave

Los pesos son techos de evidencia, no simples porcentajes de una media renormalizada.

Ejemplo:

- Study completado = 10/10.
- Recall 80% = 16/20.
- Quiz 80% = 28/35.
- Sin Review = 0/25.
- Sin Application = 0/10.

Mastery:

```text
10 + 16 + 28 + 0 + 0 = 54/100
```

Así, estudiar y aprobar una evaluación corta puede demostrar comprensión, pero no dominio consolidado.

## 3.3 Agregación por tipo

Para `recall`, `quiz` y `application`, el componente usa hasta las tres evidencias más recientes:

```text
latest      60%
previous    30%
third       10%
```

Si existe una sola evidencia, se usa completa.

Si existen dos:

```text
latest   70%
previous 30%
```

No se aplica decay temporal oculto en v0.1.

El olvido se representa mediante:

- evidencia reciente débil;
- repaso vencido;
- estado `reinforce`.

FSRS será responsable de un modelo de retención más sofisticado cuando se implemente Review.

---

# 4. Mastery Engine v0.1

## 4.1 Fórmula

Sea cada componente normalizado entre 0 y 1:

```text
S = study
R = recall
Q = quiz
V = review
A = application
```

Entonces:

```text
MasteryScore =
  10*S +
  20*R +
  35*Q +
  25*V +
  10*A
```

Resultado redondeado:

```text
0..100
```

## 4.2 Estados derivados

### Pending

- no existe evidencia; o
- `MasteryScore < 10`.

### Studying

- existe evidencia; y
- todavía no se cumplen condiciones de `Understood`.

### Understood

Debe cumplirse:

```text
MasteryScore >= 50
```

y existir al menos una señal de recuperación/práctica:

```text
recall >= 0.70
OR
quiz >= 0.70
```

### Mastered

Debe cumplirse:

```text
MasteryScore >= 75
```

más:

```text
recall >= 0.70 OR quiz >= 0.70
```

y:

- al menos 2 repasos exitosos;
- separados al menos 24 horas.

**Nota:** la regla se especifica desde ahora, pero puede no ser alcanzable en V0.1 si Review/FSRS todavía no está implementado.

### Reinforce

`reinforce` es un override del estado.

Se activa cuando ocurra al menos una condición:

- último Recall < 0.60;
- último Quiz < 0.60;
- existe Review vencido y el Topic ya estuvo en `understood` o `mastered`;
- usuario marca manualmente “Need review”.

El `MasteryScore` no se borra: el estado comunica que la evidencia reciente contradice el dominio previo.

## 4.3 Completion vs Mastery

Se almacenan por separado.

### CompletionScore

Responde:

> ¿Cuánto del contenido he trabajado?

### MasteryScore

Responde:

> ¿Cuánta evidencia tengo de que lo comprendo/recuerdo/aplico?

Un usuario puede tener:

```text
Completion: 100
Mastery: 54
Status: Understood
```

Eso es válido.

---

# 5. Recommendation Engine v0.1

## 5.1 Principio

No se usa IA.

El motor implementa la prioridad de producto mediante bandas de puntuación para que una categoría de menor prioridad nunca gane por acumulación accidental.

## 5.2 Bandas

| Motivo | Base |
|---|---:|
| Próxima clase/examen/entrega | 500 |
| Repaso vencido | 400 |
| Prerrequisito débil | 300 |
| Continuar sesión reciente | 200 |
| Siguiente Topic secuencial | 100 |

## 5.3 Próximo evento

Se considera evento próximo dentro de 7 días.

Bonus propuesto:

```text
<= 24 h   +80
<= 72 h   +50
<= 7 d    +20
```

Se añade un bonus por debilidad:

```text
(100 - MasteryScore) * 0.20
```

máximo +20.

## 5.4 Review due

```text
base = 400
```

Bonus por atraso:

```text
+ min(overdueDays * 5, 50)
```

## 5.5 Weak prerequisite

Aplica cuando un Topic objetivo tiene un prerequisite Topic que no está `understood` o `mastered`.

```text
base = 300
+ gapSeverity
```

Donde:

```text
gapSeverity = min(100 - prerequisiteMastery, 50)
```

## 5.6 Continue recent

Si la última sesión incompleta pertenece a las últimas 24 horas:

```text
base = 200
```

Bonus:

```text
+20 si fue hace menos de 2 h
+10 si fue hace menos de 8 h
```

## 5.7 Next sequential

Si no existe una señal superior:

```text
base = 100
```

Se elige el siguiente Topic por `order`.

## 5.8 Tie-breakers

En empate:

1. menor `MasteryScore`;
2. evento más cercano;
3. Topic con menor `order`;
4. ID estable para resultado determinista.

## 5.9 Salida obligatoria

Toda recomendación debe devolver:

```text
topicId
priorityScore
reasonCode
reasonText
estimatedMinutes
supportingIds
```

Ejemplo de UX:

```text
Next Study Action
Arquitectura de autopilotos
25 min

Why:
Próxima clase + dominio actual bajo.
```

---

# 6. Golden Topic v0.1

## 6.1 Selección

```text
Fundamentos UAS
→ Bloque I
→ Radioenlaces en sistemas UAS
```

Se elige porque el material maestro ya confirma que el bloque incluye:

- mando/control;
- vídeo;
- telemetría;
- estaciones;
- receptores;
- TX/RX;
- antenas.

## 6.2 Límite de contenido actual

Los documentos maestros disponibles describen el alcance temático, pero no proporcionan teoría suficiente para redactar una lección técnica canónica completa.

Por tanto:

- se crea el schema real;
- se crean IDs;
- se crean placeholders;
- no se inventan respuestas oficiales;
- la teoría se completa con guía docente/material de clase.

## 6.3 Estructura

```text
Orient
Learning objectives
Learn
Concepts
Skills
Active Recall
Practice
Connections
Notes
Study actions
```

El archivo de ejemplo se entrega como:

`golden-topic.radioenlaces.v0.1.mdx`

---

# 7. Persistencia

## 7.1 Contenido

Versionado en Git:

```text
/content
  /courses
    /fundamentals-uas
      /blocks
      /topics
```

## 7.2 Datos personales

IndexedDB / Dexie:

```text
studySessions
learningEvidence
topicProgress
notes
```

En V0.1 el contenido nunca escribe progreso dentro de los archivos MDX.

---

# 8. Dexie schema mínimo sugerido

```text
schemaVersion: 1

studySessions: id, startedAt, *topicIds, mode
learningEvidence: id, topicId, type, occurredAt, *conceptIds, *skillIds
topicProgress: topicId, status, masteryScore, lastStudiedAt, reviewDueAt
notes: id, topicId, updatedAt
```

`Course`, `Block`, `Topic`, `Concept`, `Skill` y objetivos pueden cargarse desde contenido versionado y no requieren duplicación inmediata en IndexedDB.

---

# 9. API de dominio sugerida

```ts
recordEvidence(input): LearningEvidence

calculateTopicMastery(
  topicId,
  evidence,
  config
): TopicProgress

generateRecommendations(
  context,
  config
): Recommendation[]

getNextStudyAction(
  context,
  config
): Recommendation | null
```

No deben recibir componentes React ni clientes de Supabase.

---

# 10. Configuración inicial

```json
{
  "mastery": {
    "weights": {
      "study": 10,
      "recall": 20,
      "quiz": 35,
      "review": 25,
      "application": 10
    },
    "understoodScore": 50,
    "masteredScore": 75,
    "weakAttemptThreshold": 0.6,
    "understoodEvidenceThreshold": 0.7,
    "minSuccessfulSpacedReviewsForMastery": 2,
    "minReviewSeparationHours": 24
  },
  "recommendation": {
    "eventBand": 500,
    "reviewBand": 400,
    "prerequisiteBand": 300,
    "continuationBand": 200,
    "sequentialBand": 100,
    "upcomingEventWindowDays": 7,
    "recentSessionWindowHours": 24
  }
}
```

Los valores son configuración de producto y deben poder cambiar sin migrar datos personales.

---

# 11. Tests mínimos

## 11.1 Mastery

### M-01 — lectura sola no domina

Input:

```text
study = 1
```

Expected:

```text
MasteryScore = 10
Status = Studying
```

### M-02 — comprensión a corto plazo

Input:

```text
study = 1
recall = 0.8
quiz = 0.8
```

Expected:

```text
10 + 16 + 28 = 54
Status = Understood
```

### M-03 — score alto sin spaced review no es Mastered

Aunque el score llegue al umbral mediante otras evidencias, sin 2 repasos válidos:

```text
Status != Mastered
```

### M-04 — evidencia débil reciente fuerza Reinforce

Último quiz:

```text
0.50
```

en un Topic previamente Understood:

```text
Status = Reinforce
```

## 11.2 Recommendations

### R-01

Evento próximo gana frente a secuencia normal.

### R-02

Review vencido gana frente a prerequisite débil.

### R-03

Prerequisite débil gana frente a continuar sesión.

### R-04

Sin señales especiales se recomienda siguiente Topic por orden.

### R-05

Toda recomendación incluye `reasonText`.

---

# 12. Vertical Slice que debe validar el modelo

```text
Dashboard
↓
Courses
↓
Fundamentos UAS
↓
Bloque I
↓
Radioenlaces
↓
Start Study
↓
Mark as Studied
↓
LearningEvidence(type=study)
↓
calculateTopicMastery()
↓
TopicProgress persiste en IndexedDB
↓
Dashboard se actualiza
↓
cerrar/reabrir
↓
progreso persiste
↓
offline
↓
Topic sigue disponible
```

En la V0.1 estricta, Recall/Quiz pueden permanecer visibles como estructura pero deshabilitados/TBD hasta Active Study.

---

# 13. Definition of Done de Learning Engine v0.1

- [ ] DEC-20260903-001 registrada.
- [ ] Contratos TypeScript incluidos.
- [ ] Config de mastery fuera de la UI.
- [ ] `recordEvidence()` implementado.
- [ ] `calculateTopicMastery()` con tests.
- [ ] `generateRecommendations()` con tests.
- [ ] `getNextStudyAction()` determinista.
- [ ] Golden Topic cargable desde `/content`.
- [ ] Mark as Studied crea evidencia.
- [ ] Progreso persiste en Dexie.
- [ ] Dashboard refleja progreso derivado.
- [ ] Datos persisten tras reinicio.
- [ ] Golden Topic disponible offline.
- [ ] No existe dependencia de OpenAI/Supabase para el flujo.

---

# 14. Decisiones que quedan abiertas

No se congelan todavía:

- fórmula final de mastery;
- threshold definitivo de cada estado;
- duración recomendada de las sesiones;
- modelo final de Skill Mastery;
- cómo incorporar dificultad de preguntas;
- implementación FSRS;
- time decay;
- visualización exacta del Knowledge Graph;
- sincronización cloud;
- AI Tutor.

Estas decisiones deben validarse con uso real antes de aumentar complejidad.

---

# 15. Próximo handoff

El siguiente handoff a Codex debe pedir exclusivamente:

> Implementar la vertical slice V0.1 usando estos contratos, sin añadir AI, Supabase, FSRS completo, simuladores ni nuevas entidades fuera de la especificación.

El objetivo no es construir todo UAS Study Hub.

El objetivo es demostrar que el motor de aprendizaje puede registrar evidencia, calcular progreso, recomendar una siguiente acción y conservar los datos offline.
