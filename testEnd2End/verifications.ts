import { Page } from '@playwright/test';
import { SELECTORS } from './selectors';

export type ActionResult<T> = Promise<T>;
export type Verification<T> = (page: Page) => ActionResult<T>;

export const Verifications = {
  listeEstVide: (): Verification<boolean> =>
    async (page) => {
      const count = await page.locator(SELECTORS.todoList).count();
      return count === 0;
    },

  listeContient: (labels: string[]): Verification<boolean> =>
    async (page) => {
      const items = page.locator(SELECTORS.todoList);
      const itemLabels = await items.locator('label').allTextContents();
      return JSON.stringify(itemLabels.sort()) === JSON.stringify(labels.sort());
    },

  itemExiste: (label: string): Verification<boolean> =>
    async (page) => {
      const count = await page
        .locator(SELECTORS.todoList)
        .filter({ hasText: label })
        .count();
      return count > 0;
    },

  itemNExistePas: (label: string): Verification<boolean> =>
    async (page) => {
      const count = await page
        .locator(SELECTORS.todoList)
        .filter({ hasText: label })
        .count();
      return count === 0;
    },

  nombreItems: (expected: number): Verification<boolean> =>
    async (page) => {
      const count = await page.locator(SELECTORS.todoList).count();
      return count === expected;
    },

  itemEstTermine: (label: string): Verification<boolean> =>
    async (page) => {
      const item = page.locator(SELECTORS.todoList).filter({ hasText: label }).first();
      const count = await item.count();
      if (count === 0) return false;
      const cls = await item.getAttribute('class');
      return (cls?.split(/\s+/).includes('completed')) ?? false;
    },

  itemEstActif: (label: string): Verification<boolean> =>
    async (page) => {
      const item = page.locator(SELECTORS.todoList).filter({ hasText: label }).first();
      const count = await item.count();
      if (count === 0) return false;
      const cls = await item.getAttribute('class');
      const hasCompleted = cls?.split(/\s+/).includes('completed') ?? false;
      return !hasCompleted;
    },
};
