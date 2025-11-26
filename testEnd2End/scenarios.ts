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

export async function scenarioMarquerTermineEtFiltrer(page: Page, url: string): ActionResult<void> {
  await Actions.ouvrirPage(url)(page);

  await Actions.ajouterItem('Tâche 1')(page);
  await Actions.ajouterItem('Tâche 2')(page);

  await Actions.marquerCommeTermine('Tâche 1')(page);

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

  await Actions.marquerCommeTermine('Tâche A')(page);

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
  await Actions.marquerCommeTermine('Tâche A')(page);
  await Actions.marquerCommeTermine('Tâche C')(page);

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


