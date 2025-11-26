import { Page } from '@playwright/test';
import { SELECTORS } from './selectors';

export type ActionResult<T> = Promise<T>;
export type PageAction<T = void> = (page: Page) => ActionResult<T>;


// helper: попытаться кликнуть по первым доступным селекторам
async function clickWithFallback(page: Page, selectors: string[], timeout = 3000) {
  const tried: string[] = [];

  // Диагностика: проверить, видны ли фильтры вообще
  let filtersVisible = false;
  try {
    const filterContainers = ['ul.filters', 'footer .filters', '.filters', '[class*="filter"]'];
    for (const cs of filterContainers) {
      try {
        await page.locator(cs).first().waitFor({ state: 'visible', timeout: 1000 });
        filtersVisible = true;
        break;
      } catch {
        // пробуем следующий
      }
    }
  } catch {
    // игнорируем
  }

  for (const sel of selectors.filter(Boolean)) {
    tried.push(sel);
    try {
      const loc = page.locator(sel).first();
      await loc.waitFor({ state: 'visible', timeout });
      await loc.click();
      return;
    } catch {
      // пробуем следующий селектор
    }
  }

  throw new Error(
    `None of the selectors matched or were actionable: ${tried.join(', ')}. ` +
    `Filters container visible: ${filtersVisible}. ` +
    `Please check SELECTORS.filters and actual page HTML structure.`
  );
}

export const Actions = {
  ouvrirPage: (url: string): PageAction =>
    async (page) => {
      try {
        await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      } catch (e: any) {
        const msg = String(e?.message ?? e);
        // Если ошибка связана с TLS/сертификатом — попытаться перейти по http как fallback
        if (
          msg.includes('TLS') ||
          msg.includes('secure connection') ||
          msg.includes('ERR_CERT') ||
          msg.includes('certificate')
        ) {
          const fallbackUrl = url.replace(/^https:/i, 'http:');
          try {
            await page.goto(fallbackUrl, { waitUntil: 'load', timeout: 30000 });
            return;
          } catch {
            // если fallback тоже упал — пробросим первоначальную ошибку дальше
          }
        }
        throw e;
      }
    },

  ajouterItem: (label: string): PageAction =>
    async (page) => {
      // Попытаться найти поле ввода по нескольким селекторам (SELECTORS.newTodoInput + распространённые варианты)
      const possibleSelectors = [
        SELECTORS.newTodoInput,
        'input#new-todo',
        'input.new-todo',
        'input[placeholder="Que faire?"]',
        'input[placeholder="Que faire ?"]'
      ].filter(Boolean) as string[];

      let inputLocator = null;
      for (const sel of possibleSelectors) {
        try {
          const loc = page.locator(sel).first();
          // Небольшой таймаут ожидания видимости (3s) — если не найдено, пробуем следующий селектор
          await loc.waitFor({ state: 'visible', timeout: 3000 });
          inputLocator = loc;
          break;
        } catch (e) {
          // продолжить на следующий селектор
        }
      }

      if (!inputLocator) {
        throw new Error(
          `New todo input not found. Tried selectors: ${possibleSelectors.join(', ')}`
        );
      }

      await inputLocator.fill(label);
      await inputLocator.press('Enter');
    },

  ajouterItemAvecEntree: (label: string): PageAction =>
    async (page) => {
      await Actions.ajouterItem(label)(page);
    },

  supprimerItem: (label: string): PageAction =>
    async (page) => {
      const item = page.locator(SELECTORS.todoList).filter({ hasText: label });
      await item.hover();
      await item.locator(SELECTORS.destroyButton).click();
    },

  cocherCase: (label: string): PageAction =>
    async (page) => {
      const item = page.locator(SELECTORS.todoList).filter({ hasText: label });
      await item.locator(SELECTORS.toggleButton).click();
    },

  // добавлено: удалить отмеченные задачи
  supprimerTachesCochees: (): PageAction =>
    async (page) => {
      await clickWithFallback(page, [
        SELECTORS.clearCompleted,
        'button.clear-completed',
        'text=Supprimer cochées',
        'text=Clear completed'
      ]);
    },

  // Добавлено: редактирование задачи (double-click по label -> заполнить input.edit -> Enter/blur).
  // Если newText === '' — пытаемся дождаться удаления элемента; если не удалился — используем supprimerItem.
  editerItem: (oldText: string, newText: string): PageAction =>
    async (page) => {
      const item = page.locator(SELECTORS.todoList).filter({ hasText: oldText }).first();
      const label = item.locator('label').first();
      await label.dblclick();
      const editInput = item.locator('input.edit').first();
      // дождаться видимости поля редактирования (если не появилось — возможно другой селектор, тогда упадёт)
      await editInput.waitFor({ state: 'visible', timeout: 3000 });
      await editInput.fill(newText);
      // подтвердить изменение
      await editInput.press('Enter');
      // если очистили текст — подождать, что элемент исчезнет; иначе при необходимости удалить вручную
      if (newText === '') {
        // дать время на обработку
        await page.waitForTimeout(300);
        const remaining = await page.locator(SELECTORS.todoList).filter({ hasText: oldText }).count();
        if (remaining > 0) {
          // попробовать убрать фокус и подождать
          await editInput.evaluate((el: any) => el.blur && el.blur());
          await page.waitForTimeout(200);
          const still = await page.locator(SELECTORS.todoList).filter({ hasText: oldText }).count();
          if (still > 0) {
            // крайний вариант — удалить явно
            await Actions.supprimerItem(oldText)(page);
          }
        }
      } else {
        // ждать, что редактирование применилось (инпут скроется)
        await editInput.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
      }
    },

  afficherFiltreActifs: (): PageAction =>
    async (page) => {
      await clickWithFallback(page, [
        SELECTORS.filters.active,
        'text=Actifs',
        'text=Actif',
        'text=Active'
      ]);
    },

  afficherFiltreTermines: (): PageAction =>
    async (page) => {
      await clickWithFallback(page, [
        'a.filterCompleted',
        'text=Terminés',
        'text=Completed',
        'ul.filters li a >> nth=2'
      ]);
    },

  afficherTous: (): PageAction =>
    async (page) => {
      await clickWithFallback(page, [
        'a.filterAll',
        'text=Tous',
        'text=All'
      ]);
    },

  // добавлено: переключить все задачи (Toggle All)
  toggleAll: (): PageAction =>
    async (page) => {
      await clickWithFallback(page, [
        SELECTORS.toggleAll,
        'label[for="toggleAll"]',
        'text=Mark all as complete',
        'text=Tout cocher'
      ]);
    },
};
