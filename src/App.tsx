import React, { useState, useEffect } from "react";
import { Input, Checkbox, Collapse, Button } from "antd";
import {
  addTaskService,
  addSubtaskService,
  getTasksService,
  updateSubtaskService,
  updateTaskService,
  updateBatchSubtaskService,
} from "./todo.service";
import { SubtaskInput, TaskInput } from "./api.interface";
import "./App.css";

const { Panel } = Collapse;

enum STATUS {
  PENDING = "pending",
  COMPLETE = "complete",
}

export interface Subtask {
  id: string;
  title: string;
  status: string;
  todoId: string;
  createAt: string;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  createAt: string;
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
    const taskList = await getTasksService();
    setTasks(taskList);
  };
  const addTask = async () => {
    if (newTaskText.trim() === "") return;

    const newTask: TaskInput = {
      title: newTaskText,
    };
    const resultNewTask = await addTaskService(newTask);
    setTasks((prevTasks) => [...prevTasks, resultNewTask]);
    setNewTaskText("");
  };

  const addSubtask = async (taskId: string) => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return;

    const newSubtask: SubtaskInput = {
      title: newSubtaskText,
      todoId: taskId,
    };

    const resultNewSubtask = await addSubtaskService(newSubtask);

    const updatedTasks = [...tasks];
    updatedTasks[taskIndex].subtasks = [
      ...updatedTasks[taskIndex].subtasks,
      resultNewSubtask,
    ];
    const newTask = await updateTaskService(taskId, { status: STATUS.PENDING });
    updatedTasks[taskIndex].status = newTask.attributes.status;
    setTasks(updatedTasks);
    setNewSubtaskText("");
  };

  const toggleTask = async (taskId: string) => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return;

    const updatedTasks = [...tasks];
    const taskStatus =
      updatedTasks[taskIndex].status === STATUS.PENDING
        ? STATUS.COMPLETE
        : STATUS.PENDING;
    const newTask = await updateTaskService(taskId, { status: taskStatus });
    updatedTasks[taskIndex].status = newTask.attributes.status;

    const batchIds = updatedTasks[taskIndex].subtasks.map((i) => Number(i.id));
    const subtasks = await updateBatchSubtaskService({
      batchIds,
      data: { status: taskStatus },
    });
    updatedTasks[taskIndex].subtasks = [...subtasks];
    setTasks(updatedTasks);
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    const taskIndex = tasks.findIndex((task) => task.id === taskId);
    if (taskIndex === -1) return;

    const subtaskIndex = tasks[taskIndex].subtasks.findIndex(
      (subtask) => subtask.id === subtaskId
    );
    if (subtaskIndex === -1) return;

    const updatedTasks = [...tasks];

    const subtask = updatedTasks[taskIndex].subtasks[subtaskIndex];
    const updateStatus =
      subtask.status === STATUS.PENDING ? STATUS.COMPLETE : STATUS.PENDING;
    const resultSubtask = await updateSubtaskService(subtaskId, {
      status: updateStatus,
    });
    if (resultSubtask.status === STATUS.PENDING) {
      updatedTasks[taskIndex].status = STATUS.PENDING;
    }
    updatedTasks[taskIndex].subtasks[subtaskIndex] = resultSubtask;
    const taskStatus = updatedTasks[taskIndex].subtasks.every(
      (i) => i.status === STATUS.COMPLETE
    )
      ? STATUS.COMPLETE
      : STATUS.PENDING;
    const newData = { status: taskStatus };
    const newTask = await updateTaskService(taskId, newData);
    updatedTasks[taskIndex].status = newTask.attributes.status;
    setTasks(updatedTasks);
  };

  return (
    <div className="wrapper-container">
      <div className="wrapper-input-task">
        <Input
          className="input-task"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onPressEnter={addTask}
          placeholder="Add a task..."
        />
        <Button onClick={addTask}>Add a Task</Button>
      </div>

      <br />
      <br />
      <Collapse className="wrapper-collapse">
        {tasks.map((task) => (
          <Panel
            key={task.id}
            header={
              <div className="wrapper-collapse-header">
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
              <li className="wrapper-input-subtask">
                <Input
                  className="input-subtask"
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  placeholder="Add a subtask..."
                />
                <Button onClick={() => addSubtask(task.id)}>Add Subtask</Button>
              </li>
            </ul>
          </Panel>
        ))}
      </Collapse>
    </div>
  );
};

export default TodoApp;
