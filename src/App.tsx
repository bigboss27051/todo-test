import React, { useState, useEffect } from "react";
import { Input, Checkbox, Collapse } from "antd";
import axios from "axios";
import { TaskResponse } from "./api.interface";

const { Panel } = Collapse;

enum STATUS {
  PENDING = "pending",
  COMPLETE = "complete",
}
interface SubtaskInput {
  id?: string;
  text?: string;
  status?: string;
  todoId?: string;
}

interface TaskInput {
  id?: string;
  text?: string;
  status?: STATUS;
  subtasks?: Subtask[];
}

interface Subtask {
  id: string;
  title: string;
  status: string;
  todoId: string;
  createAt: string
}

interface Task {
  id: string;
  title: string;
  status: string;
  createAt: string
  subtasks: Subtask[];
}

const TodoApp: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState("");
  const [newSubtaskText, setNewSubtaskText] = useState("");

  useEffect(() => {
    getTasks();
  }, []);

  const getTasks = async () => {
    const res = await axios.get("http://localhost:3001/api/v1/todos");
    const taskList = res.data.data.map((i: TaskResponse) => {
      return {
        id: i.id,
        ...i.attributes,
        subtasks: i.relationships.subtask.data.map((e) => {
          return {
            id: e.id,
            ...e.attributes,
            todoId: e.attributes.todoId.toString()
          };
        }),
      };
    });
    setTasks(taskList);
  };

  const addTaskService = async (newTask: TaskInput) => {
    const res = await axios.post("http://localhost:3001/api/v1/todos", newTask);
    const taskList = res.data.data.map((i: TaskResponse) => {
      return {
        id: i.id,
        ...i.attributes,
        subtasks: i.relationships.subtask.data.map((e) => {
          return {
            id: e.id,
            ...e.attributes,
          };
        }),
      };
    });
    const { id, relationships, attributes }: TaskResponse = res.data.data;
    const task: Task = {
      id,
      ...attributes,
      subtasks: relationships.subtask.data.map((e) => {
        const { id, attributes } = e;
        return {
          id,
          ...attributes,
          todoId: e.attributes.todoId.toString()
        };
      }),
    };
    console.log({ task });
    setTasks([...tasks, task]);
  };

  const addTask = async () => {
    if (newTaskText.trim() === "") return;

    const newTask: TaskInput = {
      text: newTaskText,
    };
    // :TODO call api create task
    // setTasks((prevTasks) => [...prevTasks, newTask]);
    setNewTaskText("");
  };

  const addSubtask = async (taskId: string) => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return;

    const newSubtask: SubtaskInput = {
      text: newSubtaskText,
      todoId: taskId,
    };

    const updatedTasks = [...tasks];

    // :TODO call api create subtask
    // updatedTasks[taskIndex].subtasks = [...updatedTasks[taskIndex].subtasks, newSubtask];
    updatedTasks[taskIndex].status = STATUS.PENDING;
    setTasks(updatedTasks);
    setNewSubtaskText("");
  };

  const toggleTask = (taskId: string) => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return;

    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].status =
      updatedTasks[taskIndex].status === STATUS.PENDING
        ? STATUS.COMPLETE
        : STATUS.PENDING;

    if (updatedTasks[taskIndex].status === STATUS.COMPLETE) {
      const batchIds = updatedTasks[taskIndex].subtasks.map((i) =>
        Number(i.id)
      );
      // TODO: call api batch update status subtasks
    }

    setTasks(updatedTasks);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return;

    const subtaskIndex = tasks[taskIndex].subtasks.findIndex(
      (subtask) => subtask.id === subtaskId
    );
    if (subtaskIndex === -1) return;

    const updatedTasks = [...tasks];
    const subtask = updatedTasks[taskIndex].subtasks[subtaskIndex];
    subtask.status =
      subtask.status === STATUS.PENDING ? STATUS.COMPLETE : STATUS.PENDING;

    if (subtask.status === STATUS.PENDING) {
      updatedTasks[taskIndex].status = STATUS.PENDING;
    }

    updatedTasks[taskIndex].status = updatedTasks[taskIndex].subtasks.every(
      (i) => i.status === STATUS.COMPLETE
    )
      ? STATUS.COMPLETE
      : STATUS.PENDING;

    setTasks(updatedTasks);
  };

  return (
    <div>
      <Input
        value={newTaskText}
        onChange={(e) => setNewTaskText(e.target.value)}
        onPressEnter={addTask}
        placeholder="Add a task..."
      />
      <button onClick={addTask}>Add a Task</button>
      <br />
      <br />
      <Collapse>
        {tasks.map((task) => (
          <Panel
            key={task.id}
            header={
              <div>
                <Checkbox
                  checked={task.status === STATUS.COMPLETE}
                  onChange={() => toggleTask(task.id)}
                >
                  {task.title}
                </Checkbox>
                <span>
                  {
                    task.subtasks.filter(
                      (subtask) => subtask.status === STATUS.COMPLETE
                    ).length
                  }
                  /{task.subtasks.length} subtasks completed
                </span>
              </div>
            }
          >
            <ul>
              {task.subtasks.map((subtask) => (
                <li key={subtask.id}>
                  <Checkbox
                    checked={subtask.status === STATUS.COMPLETE}
                    onChange={() => toggleSubtask(task.id, subtask.id)}
                  >
                    {subtask.title}
                  </Checkbox>
                </li>
              ))}
              <li>
                <Input
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  placeholder="Add a subtask..."
                />
                <button onClick={() => addSubtask(task.id)}>Add Subtask</button>
              </li>
            </ul>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default TodoApp;
