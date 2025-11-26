export const SELECTORS = {
  newTodoInput: '.new-todo',
  todoList: '.todo-list li',
  destroyButton: '.destroy',
  heading: 'role=heading',
  toggleButton: '.toggle',
  filters: {
    all: 'a.filterAll',
    active: 'a:has-text("Actifs")',
    completed: 'a:has-text("Terminés")',
  },
  toggleAll: 'label[for="toggleAll"]',
  clearCompleted: 'button.clear-completed',
} as const;
