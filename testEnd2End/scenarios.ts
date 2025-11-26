import { Page, expect } from '@playwright/test';
import { Actions } from './actions';
import { Verifications } from './verifications';
import { ActionResult } from './actions';


export async function scenarioAjouterEtSupprimer(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  const isEmpty = await Verifications.listeEstVide()(page);
  expect(isEmpty).toBe(true);

  await Actions.ajouterItem('Tâche 1')(page);
  await Actions.ajouterItem('Tâche 2')(page);

  const hasItems = await Verifications.listeContient(['Tâche 1', 'Tâche 2'])(page);
  expect(hasItems).toBe(true);

  await Actions.supprimerItem('Tâche 2')(page);

  const remaining = await Verifications.listeContient(['Tâche 1'])(page);
  expect(remaining).toBe(true);
}

// passe pas
export async function scenarioAjouterTacheVide(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  // ajouter tache vide
  await Actions.ajouterItem('')(page);

  // la liste doit rester vide
  const estVide = await Verifications.listeEstVide()(page);
  expect(estVide).toBe(true);
}

export async function scenarioMarquerTermineEtFiltrer(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('Tâche 1')(page);
  await Actions.ajouterItem('Tâche 2')(page);

  await Actions.cocherCase('Tâche 1')(page);

  await Actions.afficherFiltreActifs()(page);
  const activeOnly = await Verifications.listeContient(['Tâche 2'])(page);
  expect(activeOnly).toBe(true);

  await Actions.afficherFiltreTermines()(page);
  const completedOnly = await Verifications.listeContient(['Tâche 1'])(page);
  expect(completedOnly).toBe(true);
}

export async function scenarioAjouterEtMarquerUneTerminee(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('Tâche A')(page);
  await Actions.ajouterItem('Tâche B')(page);

  const hasItems = await Verifications.listeContient(['Tâche A', 'Tâche B'])(page);
  expect(hasItems).toBe(true);

  await Actions.cocherCase('Tâche A')(page);

  // Проверить, что обе задачи остаются в списке (одна завершена, одна активна)
  const bothPresent = await Verifications.listeContient(['Tâche A', 'Tâche B'])(page);
  expect(bothPresent).toBe(true);
}

// Добавлено: сценарий — добавить задачу и отредактировать её
export async function scenarioAjouterEtEditer(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  // добавить задачу с исходным текстом
  await Actions.ajouterItem('Ancienne tâche')(page);

  // убедиться, что она добавлена
  const exists = await Verifications.itemExiste('Ancienne tâche')(page);
  expect(exists).toBe(true);

  // отредактировать на новый текст
  await Actions.editerItem('Ancienne tâche', 'Nouvelle tâche')(page);

  // проверить, что старого текста нет и новый присутствует
  const oldGone = await Verifications.itemNExistePas('Ancienne tâche')(page);
  expect(oldGone).toBe(true);

  const newExists = await Verifications.itemExiste('Nouvelle tâche')(page);
  expect(newExists).toBe(true);
}

// Добавлено: сценарий — добавить задачу, отредактировать, очистить и проверить исчезновение
export async function scenarioEditerEtSupprimerSiVide(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  const original = 'Tâche à vider';
  await Actions.ajouterItem(original)(page);

  const exists = await Verifications.itemExiste(original)(page);
  expect(exists).toBe(true);

  // Отредактировать в пустую строку
  await Actions.editerItem(original, '')(page);

  // Проверить, что задача исчезла
  const gone = await Verifications.itemNExistePas(original)(page);
  expect(gone).toBe(true);
}

// Добавлено: добавить A,B,C; отметить A и C; нажать "Supprimer cochées"; проверить результат
export async function scenarioSupprimerTachesCochees(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('Tâche A')(page);
  await Actions.ajouterItem('Tâche B')(page);
  await Actions.ajouterItem('Tâche C')(page);

  // убедиться, что все добавлены
  const allPresent = await Verifications.listeContient(['Tâche A', 'Tâche B', 'Tâche C'])(page);
  expect(allPresent).toBe(true);

  // отметить A и C как завершённые
  await Actions.cocherCase('Tâche A')(page);
  await Actions.cocherCase('Tâche C')(page);

  // небольшая пауза, чтобы состояние применилось
  await new Promise(r => setTimeout(r, 200));

  // удалить отмеченные задачи
  await Actions.supprimerTachesCochees()(page);

  // проверить, что A и C исчезли, а B остался
  const aGone = await Verifications.itemNExistePas('Tâche A')(page);
  const cGone = await Verifications.itemNExistePas('Tâche C')(page);
  const bExists = await Verifications.itemExiste('Tâche B')(page);

  expect(aGone).toBe(true);
  expect(cGone).toBe(true);
  expect(bExists).toBe(true);
}

// Добавлено: сценарий — Toggle All вкл/выкл и проверки
export async function scenarioToggleAll(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('Tâche 1')(page);
  await Actions.ajouterItem('Tâche 2')(page);

  // нажать Toggle All — ожидать, что обе отмечены
  await Actions.toggleAll()(page);
  const t1Done = await Verifications.itemEstTermine('Tâche 1')(page);
  const t2Done = await Verifications.itemEstTermine('Tâche 2')(page);
  expect(t1Done).toBe(true);
  expect(t2Done).toBe(true);

  // нажать Toggle All снова — ожидать, что обе стали активными
  await Actions.toggleAll()(page);
  const t1Active = await Verifications.itemEstActif('Tâche 1')(page);
  const t2Active = await Verifications.itemEstActif('Tâche 2')(page);
  expect(t1Active).toBe(true);
  expect(t2Active).toBe(true);
}

// Добавлено: сценарий — удалить задачу через кнопку "X" (destroy)
export async function scenarioSupprimerViaBoutonX(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  const label = 'Tâche à supprimer';
  await Actions.ajouterItem(label)(page);

  // убедиться, что задача добавлена
  const exists = await Verifications.itemExiste(label)(page);
  expect(exists).toBe(true);

  // удалить через кнопку "X" (destroy) — Actions.supprimerItem делает hover + click по destroy
  await Actions.supprimerItem(label)(page);

  // проверить, что задача исчезла
  const gone = await Verifications.itemNExistePas(label)(page);
  expect(gone).toBe(true);
}

// ETAPE 2
// Modèle de Tâches : N1 AjouterTâche (synchro Étape 1 → Étape 2 + JSON)
// Vérifier la synchro Étape 1 → JSON Étape 2
export async function scenarioAjouterSynchronise(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  // Ajouter une tâche dans Étape 1
  await Actions.ajouterItem('Tâche synchro')(page);

  // Vérifier que le JSON (dans <pre>) contient la tâche
  const jsonText = await page.locator('h2:text("Étape 1") + pre').innerText();
  expect(jsonText).toContain('"label": "Tâche synchro"');
}


// Étape 2 : Supprimer une tâche → JSON mis à jour
export async function scenarioSupprimerSynchronise(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('À supprimer')(page);
  await Actions.supprimerItem('À supprimer')(page);

  const jsonText = await page.locator('h2:text("Étape 1") + pre').innerText();
  expect(jsonText).not.toContain('"label": "À supprimer"');
}

// Étape 2 : Cocher une tâche → JSON mis à jour
export async function scenarioCocherSynchronise(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('À cocher')(page);
  await Actions.cocherCase('À cocher')(page);

  const jsonText = await page.locator('h2:text("Étape 1") + pre').innerText();
  expect(jsonText).toContain('"label": "À cocher"');
  expect(jsonText).toContain('"done": true');
}

// Étape 2 : Décocher une tâche → JSON mis à jour
export async function scenarioDecocherSynchronise(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('À décocher')(page);
  await Actions.cocherCase('À décocher')(page);
  await Actions.cocherCase('À décocher')(page);

  const jsonText = await page.locator('h2:text("Étape 1") + pre').innerText();
  expect(jsonText).toContain('"label": "À décocher"');
  expect(jsonText).toContain('"done": false');
}



