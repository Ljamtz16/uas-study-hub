# HANDOFF — CODEX IMPLEMENTATION
## UAS Study Hub · V0.1 Vertical Slice 01

**Handoff ID:** HOF-20260903-001  
**Proyecto:** UAS Study Hub  
**Objetivo:** Implementar la primera vertical slice funcional y offline de V0.1  
**Estado esperado al cierre:** vertical slice operativa, testeada y documentada  
**Autoridad funcional:** Master Specification v2 + Learning Engine Specification v0.1

---

# 1. Documentos de autoridad

Antes de escribir código, leer y respetar en este orden:

1. `UAS_Study_Hub_Master_Specification_v2.docx`
2. `DEC-20260903-001.md`
3. `UAS_Study_Hub_Learning_Engine_Spec_v0.1.md`
4. `learning-engine.types.v0.1.ts`
5. `learning-engine.config.v0.1.json`
6. `golden-topic.radioenlaces.v0.1.mdx`

Regla:
- La Master Specification define producto, stack, roadmap, offline-first y alcance V0.1.
- La Learning Engine Specification define lógica de dominio.
- Los contratos TypeScript y config son la referencia concreta de implementación.
- El Golden Topic es contenido piloto y no debe rellenarse con teoría inventada.

Si aparece una contradicción:
1. detener la decisión afectada;
2. documentar el conflicto;
3. no improvisar un cambio transversal.

---

# 2. Alcance exacto

Implementar únicamente esta vertical slice:

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
Start Study / abrir Topic
↓
Mark as Studied
↓
crear LearningEvidence(type=study)
↓
calcular TopicProgress / Mastery
↓
persistir en IndexedDB con Dexie
↓
actualizar Dashboard
↓
cerrar/reabrir
↓
verificar persistencia
↓
poner navegador offline
↓
abrir Topic
↓
verificar funcionamiento offline
```

No ampliar el producto fuera de este flujo.

---

# 3. Stack obligatorio

Usar:
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand
- IndexedDB + Dexie.js
- Markdown/MDX
- Vitest
- Playwright
- PWA / Service Worker

No sustituir el stack sin registrar una decisión.

---

# 4. Fuera de alcance

NO implementar:
- Supabase
- OpenAI
- AI Tutor
- autenticación
- multiusuario
- cloud sync
- FSRS completo
- flashcards
- quiz engine completo
- Knowledge Graph / React Flow
- Engineering Lab
- simuladores
- Capacitor
- APK
- integración con Notion
- integración con Google Calendar
- gamificación
- analytics avanzados
- nuevas entidades de dominio no especificadas

---

# 5. Estructura de repositorio sugerida

```text
uas-study-hub/
├── app/
│   ├── page.tsx
│   ├── courses/
│   │   ├── page.tsx
│   │   └── [courseId]/
│   │       └── page.tsx
│   ├── study/
│   │   └── [topicId]/
│   │       └── page.tsx
│   └── settings/
│       └── page.tsx
├── components/
├── features/
│   ├── courses/
│   ├── study/
│   └── progress/
├── lib/
│   ├── db/
│   │   ├── db.ts
│   │   ├── schema.ts
│   │   └── repositories/
│   ├── learning/
│   │   ├── types.ts
│   │   ├── config.ts
│   │   ├── evidence.ts
│   │   ├── mastery.ts
│   │   └── recommendations.ts
│   └── content/
│       ├── loader.ts
│       └── validation.ts
├── content/
│   └── courses/
│       └── fundamentals-uas/
│           ├── course.json
│           ├── blocks/
│           │   └── intro-radio-links.json
│           └── topics/
│               └── golden-topic.radioenlaces.v0.1.mdx
├── public/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
└── docs/
    ├── master/
    └── learning-engine/
```

---

# 6. Contratos de dominio

Usar como base `learning-engine.types.v0.1.ts`.

Implementar al menos:
- `Course`
- `Block`
- `Topic`
- `Concept`
- `Skill`
- `LearningObjective`
- `StudySession`
- `LearningEvidence`
- `TopicProgress`
- `Recommendation`

No agregar campos obligatorios nuevos sin documentarlo.

---

# 7. IndexedDB / Dexie

Crear schema local v1.

Tablas mínimas:

```text
studySessions
learningEvidence
topicProgress
notes
```

Esquema recomendado:

```ts
studySessions: "id, startedAt, *topicIds, mode"
learningEvidence: "id, topicId, type, occurredAt, *conceptIds, *skillIds"
topicProgress: "topicId, status, masteryScore, lastStudiedAt, reviewDueAt"
notes: "id, topicId, updatedAt"
```

Reglas:
- `topicProgress.topicId` estable.
- No duplicar innecesariamente contenido académico en IndexedDB.
- Markdown/MDX permanece versionado en `/content`.
- Evidencia, notas y progreso son datos personales locales.

---

# 8. LearningEvidence

Implementar:

```ts
recordEvidence(input): Promise<LearningEvidence>
```

Para V0.1 se requiere al menos:

```text
type = "study"
normalizedScore = 1
```

al pulsar `Mark as Studied`.

Debe registrar:
- id
- topicId
- type
- normalizedScore
- occurredAt
- sourceKind / sourceId cuando aplique

---

# 9. Mastery Engine

Implementar:

```ts
calculateTopicMastery(
  topicId,
  evidence,
  config
): TopicProgress
```

Pesos:

```text
study        10
recall       20
quiz         35
review       25
application  10
```

Fórmula:

```text
MasteryScore =
10*S +
20*R +
35*Q +
25*V +
10*A
```

Para V0.1, `Mark as Studied` debe producir:

```text
study = 1
MasteryScore = 10
Status = studying
```

No marcar `mastered`.

Mantener separado:
- `completionScore`
- `masteryScore`

---

# 10. Estados

```text
pending
studying
understood
mastered
reinforce
```

Reglas:

## Pending
Sin evidencia o mastery < 10.

## Studying
Existe evidencia, pero no se cumplen condiciones de understood.

## Understood
Mastery >= 50 y Recall >= 0.70 o Quiz >= 0.70.

## Mastered
Mastery >= 75 y:
- recall/quiz suficiente;
- 2 spaced reviews exitosos separados >= 24h.

Puede quedar inalcanzable en V0.1.

## Reinforce
Preparar la regla aunque la UI no necesite exponer toda la funcionalidad todavía.

---

# 11. Recommendation Engine

Implementar:

```ts
generateRecommendations(context, config): Recommendation[]
getNextStudyAction(context, config): Recommendation | null
```

Bandas:

```text
upcoming_event       500
review_due           400
weak_prerequisite    300
continue_recent      200
next_sequential      100
```

Para V0.1 basta con:
- `continue_recent`
- `next_sequential`

y dejar estructura preparada para el resto.

Toda Recommendation debe incluir:

```text
topicId
priorityScore
reasonCode
reasonText
estimatedMinutes
generatedAt
```

---

# 12. Dataset mínimo

Crear únicamente lo necesario para navegar:

```text
Course:
Fundamentos de Sistemas Aéreos No Tripulados
```

```text
Block:
I · Introducción y radioenlaces
```

```text
Topic:
Radioenlaces en sistemas UAS
```

Usar el Golden Topic suministrado.

No inventar contenido académico para completar las secciones TBD.

---

# 13. Pantallas requeridas

## Dashboard
Mostrar mínimo:
- título UAS Study Hub;
- Next Study Action;
- progreso de Fundamentos;
- número de Topics estudiados.

## Courses
Mostrar Fundamentos UAS.

## Course Detail
Mostrar:
```text
Bloque I
└── Radioenlaces
```
y status/progreso.

## Topic Study View
Mostrar:
- título;
- dificultad;
- learning objectives;
- contenido MDX;
- conceptos;
- skills;
- notas personales;
- botón `Mark as Studied`.

Si Recall/Practice contiene placeholders:
- mostrar como pendiente;
- no inventar respuestas.

---

# 14. Notes

Implementar nota personal simple por Topic.

Requisitos:
- textarea;
- autosave o Save explícito;
- persistencia Dexie;
- cerrar/reabrir conserva nota.

---

# 15. Dashboard Progress

Cuando `Mark as Studied`:

1. crear `LearningEvidence`;
2. recalcular mastery;
3. guardar `TopicProgress`;
4. actualizar UI;
5. Dashboard refleja el cambio.

Evitar dos fuentes de verdad contradictorias.

---

# 16. PWA / Offline

Implementar PWA instalable.

Criterio mínimo:

1. cargar la aplicación online una vez;
2. abrir Fundamentos y Radioenlaces;
3. cerrar;
4. activar offline en DevTools;
5. recargar;
6. Dashboard/Courses/Topic siguen disponibles;
7. progreso y nota siguen disponibles.

Cachear:
- app shell;
- rutas esenciales;
- Golden Topic y assets necesarios.

---

# 17. Settings / Data

Implementar `/settings`.

Debe incluir:
- indicador de persistencia local;
- estado offline/online;
- botón Export Data.

Exportar JSON con al menos:

```json
{
  "schemaVersion": 1,
  "exportedAt": "...",
  "studySessions": [],
  "learningEvidence": [],
  "topicProgress": [],
  "notes": []
}
```

---

# 18. Tests Vitest

Obligatorios:

### M-01
Solo study:
```text
MasteryScore = 10
Status = studying
```

### M-02
Study + recall .8 + quiz .8:
```text
MasteryScore = 54
Status = understood
```

### M-03
No `mastered` sin spaced reviews.

### M-04
Evidencia reciente débil puede producir `reinforce`.

### R-01
Una categoría de mayor banda gana frente a una de menor banda.

### R-02
Sin señales especiales, `next_sequential`.

### R-03
Toda Recommendation tiene `reasonText`.

### C-01
IDs del dataset son únicos.

### C-02
Topic referencia un Block existente.

### C-03
Block referencia un Course existente.

---

# 19. Tests Playwright

## E2E-01 — Main vertical slice

```text
Home
→ Courses
→ Fundamentos
→ Radioenlaces
→ Mark as Studied
→ volver Dashboard
→ progreso cambió
```

## E2E-02 — Persistence

```text
marcar estudiado
→ reload
→ estado persiste
```

## E2E-03 — Notes

```text
escribir nota
→ reload
→ nota persiste
```

## E2E-04 — Offline

Si el entorno lo permite de manera fiable:

```text
precargar
→ simular offline
→ abrir Topic
```

Si no, documentar test manual reproducible.

---

# 20. Criterios de aceptación

Terminar solo si:

- [ ] AC-01 PWA instalable y usable offline después de primera carga.
- [ ] AC-02 navegación Fundamentos → Bloque → Topic sin errores.
- [ ] AC-03 Mark as Studied persiste tras cerrar/reabrir.
- [ ] AC-04 nota personal se conserva localmente.
- [ ] AC-05 Dashboard refleja progreso local.
- [ ] AC-06 contenido y datos personales están separados.
- [ ] AC-07 exportación JSON disponible.
- [ ] AC-08 Playwright cubre Home → Course → Topic → Mark Studied.
- [ ] `LearningEvidence(type=study)` se registra.
- [ ] Mastery de solo study queda en 10, no 100.
- [ ] No existe dependencia funcional de OpenAI o Supabase.
- [ ] No se inventó contenido académico.

---

# 21. Reglas de implementación

1. No sobrediseñar.
2. No introducir abstracciones sin uso actual claro.
3. No implementar roadmap futuro.
4. No cambiar nombres/IDs canónicos silenciosamente.
5. No mezclar progreso dentro del contenido.
6. No almacenar API keys.
7. No convertir `Mark as Studied` en `Mastered`.
8. No usar IA para calcular mastery.
9. No ocultar errores con mocks.
10. TypeScript strict.
11. Evitar `any` salvo justificación.
12. Mantener funciones de dominio puras cuando sea posible.
13. La UI consume el dominio; no redefine sus reglas.
14. Todo cambio de schema debe quedar preparado para migraciones Dexie.
15. Si algo está fuera de alcance, dejarlo fuera.

---

# 22. Orden de implementación recomendado

## Commit 1
`chore: bootstrap UAS Study Hub v0.1`

## Commit 2
`feat: add learning domain contracts and config`

## Commit 3
`feat: add golden course content loader`

## Commit 4
`feat: add local persistence with Dexie`

## Commit 5
`feat: implement mastery and recommendation engines`

## Commit 6
`feat: implement study core vertical slice`

## Commit 7
`feat: add offline PWA and data export`

## Commit 8
`test: cover v0.1 critical flows`

## Commit 9
`docs: add v0.1 implementation report`

---

# 23. Verificación antes de cerrar

Ejecutar y reportar:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npx playwright test
```

Además probar manualmente:

```text
1. abrir app
2. entrar Fundamentos
3. entrar Radioenlaces
4. escribir nota
5. Mark as Studied
6. revisar Mastery = 10
7. volver Dashboard
8. comprobar progreso
9. cerrar y reabrir
10. comprobar persistencia
11. poner offline
12. comprobar navegación
13. exportar JSON
```

---

# 24. Entregable final obligatorio

Al terminar producir:

```text
# NODE REPORT — UAS Study Hub V0.1 Vertical Slice 01

## STATUS
PASS / PARTIAL / FAIL

## FILES CREATED
...

## FILES MODIFIED
...

## IMPLEMENTED
...

## TEST RESULTS
lint:
typecheck:
unit:
build:
playwright:
offline manual:

## ACCEPTANCE CRITERIA
AC-01:
AC-02:
AC-03:
AC-04:
AC-05:
AC-06:
AC-07:
AC-08:

## DEVIATIONS
...

## OPEN ISSUES
...

## DECISIONS NEEDED
...

## NEXT RECOMMENDED STEP
...
```

No declarar PASS si existe una prueba crítica fallida.

---

# 25. Stop conditions

Detenerse y reportar antes de continuar si:
- se requiere cambiar un contrato de dominio;
- el Golden Topic no puede cargarse sin cambiar su formato;
- PWA/offline exige una decisión arquitectónica no contemplada;
- se necesita alterar schema de datos más allá de lo definido;
- aparece una contradicción entre documentos;
- la implementación requeriría una función expresamente fuera de alcance.

---

# 26. Resultado esperado

Al finalizar debe existir una aplicación pequeña pero real que demuestre:

```text
UAS Study Hub
puede cargar contenido académico real,
registrar una acción de estudio,
convertirla en evidencia,
calcular dominio,
persistir los datos,
mostrar progreso
y seguir disponible sin Internet.
```

Nada más es necesario para considerar exitosa esta primera vertical slice.
