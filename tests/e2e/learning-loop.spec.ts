import {expect,test} from "@playwright/test";
for(const offline of [false,true])test(`V0.2 learning loop, reload and recommendations ${offline?"offline":"online"}`,async({page,context})=>{
  await page.goto("/");
  await page.getByRole("link",{name:"Cursos"}).click();await page.getByRole("link",{name:"Ver curso"}).click();await page.getByRole("link",{name:"Start Study"}).click();
  await page.getByRole("button",{name:"Mark as Studied"}).click();await expect(page.getByTestId("mastery-score")).toHaveText("10/100");
  await expect(page.getByTestId("evidence-completed")).toContainText("study: 1");
  await page.getByLabel("Nota personal").fill("Nota previa V0.1");await page.waitForTimeout(800);
  if(offline){await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await expect(page.getByTestId("mastery-score")).toHaveText("10/100");await context.setOffline(true);await page.reload();}
  await page.getByLabel("Respuesta local (opcional)").fill("Mi reflexión local");await page.getByRole("button",{name:"Lo recordé",exact:true}).click();
  await expect(page.getByRole("status")).toContainText("Mastery anterior: 10/100");await expect(page.getByTestId("mastery-score")).toHaveText("30/100");await page.reload();
  await expect(page.getByTestId("evidence-completed")).toContainText("recall: 1");await expect(page.getByTestId("mastery-score")).toHaveText("30/100");
  await page.getByRole("radio",{name:"Radioenlaces en sistemas UAS",exact:true}).check();await page.getByRole("radio",{name:"Falso",exact:true}).check();await page.getByRole("button",{name:"Finalizar Quiz"}).click();
  await expect(page.getByRole("status")).toContainText("Mastery nuevo: 65/100");await expect(page.getByRole("status")).toContainText("Status nuevo: understood");await expect(page.getByRole("button",{name:"Finalizar Quiz"})).toBeDisabled();await page.reload();
  await expect(page.getByTestId("mastery-score")).toHaveText("65/100");await expect(page.getByTestId("evidence-completed")).toContainText("quiz: 1");await expect(page.getByLabel("Nota personal")).toHaveValue("Nota previa V0.1");
  await page.getByRole("link",{name:"Inicio"}).click();await expect(page.getByText("Continuar el tema:")).toBeVisible();await expect(page.getByTestId("course-progress")).toHaveText("100%");
});
