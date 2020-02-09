<template>
  <div id="app">
    <section class="todoapp">
      <header class="header">
        <h1>todos</h1>
        <input
          class="new-todo"
          autofocus
          autocomplete="off"
          placeholder="What needs to be done?"
          v-model="newTodo"
          @keyup.enter="addTodo"
        />
      </header>
      <!-- hide with v-cloack while mounting -->
      <section class="main" v-show="todos.length" v-cloak>
        <input
          id="toggle-all"
          class="toggle-all"
          type="checkbox"
          v-model="allDone"
        />
        <!-- css on toggle all and label -->
        <label for="toggle-all"></label>
        <ul class="todo-list">
          <li
            v-for="todo in filteredTodos"
            class="todo"
            :key="todo.id"
            :class="{ completed: todo.completed, editing: todo == editedTodo }"
          >
            <div class="view">
              <input class="toggle" type="checkbox" v-model="todo.completed" />
              <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
              <button class="destroy" @click="removeTodo(todo)"></button>
            </div>
            <input
              class="edit"
              type="text"
              v-model="todo.title"
              v-todo-focus="todo == editedTodo"
              @blur="doneEdit(todo)"
              @keyup.enter="doneEdit(todo)"
              @keyup.esc="cancelEdit(todo)"
            />
          </li>
        </ul>
      </section>
      <footer class="footer" v-show="todos.length" v-cloak>
        <span class="todo-count">
          <strong>{{ remaining }}</strong> {{ remaining | pluralize }} left
        </span>
        <ul class="filters">
          <li>
            <a
              @click="setVisibility('all')"
              :class="{ selected: visibility == 'all' }"
              >All</a
            >
          </li>
          <li>
            <a
              @click="setVisibility('active')"
              :class="{ selected: visibility == 'active' }"
              >Active</a
            >
          </li>
          <li>
            <a
              @click="setVisibility('completed')"
              :class="{ selected: visibility == 'completed' }"
              >Completed</a
            >
          </li>
        </ul>
        <button
          class="clear-completed"
          @click="removeCompleted"
          v-show="todos.length > remaining"
        >
          Clear completed
        </button>
      </footer>
    </section>
    <footer class="info">
      <p>Double-click to edit a todo</p>
      <p> Based on TodoMVC </p>
    </footer>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";

export interface ITodo {
  completed: boolean;
  id: number;
  title: string;
}

// localStorage persistence
let STORAGE_KEY = "todos-vuejs-2.0";
let todoStorage = {
  fetch: () => {
    let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    todos.forEach((todo, index) => {
      todo.id = index;
    });
    todoStorage.uid = todos.length;
    return todos;
  },
  save: todos => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  },
  uid: 0
};

// lambda syntax is a shorthand way to express functions
// with 2 important distinctionns
// 1. if not using braces, it is implied it returns the value within
// 2. the scope of 'this' is preserved, this can be good or dangerous depending on context
//    importantly, lambda functions should not be attached to classes used to create Vue Components
//    it is fine to use them within them ,just not on the class itself
export function filterActiveTodos(todos: ITodo[]) {
  return todos.filter(todo => !todo.completed);
}

export function filterCompletedTodos(todos: ITodo[]) {
  return todos.filter(todo => todo.completed);
}

@Component({
  components: {},
  // vue specific filter
  filters: {
    pluralize: (n: number) => (n === 1 ? "item" : "items")
  },
  // a custom directive to wait for the DOM to be updated
  // before focusing on the input field.
  // http://vuejs.org/guide/custom-directive.html
  directives: {
    "todo-focus": function(el, binding) {
      // only focus on item double clicked
      if (binding.value) {
        el.focus();
      }
    }
  }
})
export default class App extends Vue {
  private todos: ITodo[] = [];
  private newTodo = "";
  public editedTodo: ITodo | null = null;
  visibility = "all";
  beforeEditCache: string = "";

  // Vue component classes should not have any code here
  // as it is not in fact the Instantiated Vue Component you think it is
  constructor() {
    super();
  }

  created() {
    this.todos = todoStorage.fetch();
  }

  mounted() {}

  destroyed() {}

  // deep means to also run whenever any inner field/array item changes
  @Watch("todos", { deep: true })
  onTodosChanged(newTodos, oldTodos) {
    todoStorage.save(this.todos);
  }

  setVisibility(vis) {
    this.visibility = vis;
  }

  addTodo() {
    this.todos.push({
      id: todoStorage.uid++,
      title: this.newTodo.toString(),
      completed: false
    });
    this.newTodo = "";
  }

  removeTodo(todo: ITodo) {
    this.todos.splice(this.todos.indexOf(todo), 1);
  }

  editTodo(todo: ITodo) {
    this.beforeEditCache = todo.title;
    this.editedTodo = todo;
  }

  doneEdit(todo: ITodo) {
    if (!this.editedTodo) {
      return;
    }
    this.editedTodo = null;
    todo.title = todo.title.trim();
    if (!todo.title) {
      this.removeTodo(todo);
    }
  }

  cancelEdit(todo: ITodo) {
    this.editedTodo = null;
    todo.title = this.beforeEditCache;
  }

  removeCompleted() {
    this.todos = filterActiveTodos(this.todos);
  }

  filterAll() {
    return this.todos;
  }

  get filteredTodos() {
    if (this.visibility === "all") {
      return this.filterAll();
    } else if (this.visibility === "active") {
      return filterActiveTodos(this.todos);
    } else if (this.visibility === "completed") {
      return filterCompletedTodos(this.todos);
    }
  }

  get remaining() {
    return filterActiveTodos(this.todos).length;
  }

  // computed properties are reactive, and understand the reactivity dependency chain
  // in this case, allDone is recompute when remaining changes
  // computed properties are also cached, so referencing them in a template multiple times will not
  // run the resulting code multiple times, only once
  // the code is only rerun when the values should change based on the reactive state
  get allDone() {
    return this.remaining === 0;
  }

  set allDone(value) {
    for (let t of this.todos) {
      t.completed = value;
    }
  }
}
</script>

<style>
@import "./index.css";

[v-cloak] {
  display: none;
}
</style>
