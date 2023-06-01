import axios from "axios";
import {
  BatchSubtaskInput,
  SubtaskData,
  SubtaskInput,
  TaskInput,
  TaskResponse,
} from "./api.interface";
import { Subtask, Task } from "./App";
const HOST = "http://localhost:3001";
export const getTasksService = async (): Promise<Task[]> => {
  const res = await axios.get(`${HOST}/api/v1/todos`);
  const taskList: Task[] = res.data.data.map((i: TaskResponse) => {
    return {
      id: i.id,
      ...i.attributes,
      subtasks: i.relationships.subtask.data.map((e) => {
        return {
          id: e.id,
          ...e.attributes,
          todoId: e.attributes.todoId.toString(),
        };
      }),
    };
  });
  return taskList;
};

export const addTaskService = async (newTask: TaskInput): Promise<Task> => {
  const res = await axios.post(`${HOST}/api/v1/todos`, newTask);
  const { id, attributes }: TaskResponse = res.data.data;
  const task: Task = {
    id,
    ...attributes,
    subtasks: [],
  };
  return task;
};

export const addSubtaskService = async (newTask: SubtaskInput): Promise<Subtask> => {
  const res = await axios.post(`${HOST}/api/v1/subtasks`, newTask);
  const { id, attributes }: SubtaskData = res.data.data;
  const subtask: Subtask = {
    id,
    ...attributes,
    todoId: attributes.todoId.toString(),
  };
  return subtask;
};

export const updateSubtaskService = async (
  subtaskId: string,
  newData: SubtaskInput
): Promise<Subtask> => {
  const res = await axios.patch(
    `${HOST}/api/v1/subtasks/${subtaskId}`,
    newData
  );
  const { id, attributes }: SubtaskData = res.data.data;
  const subtask: Subtask = {
    id,
    ...attributes,
    todoId: attributes.todoId.toString(),
  };
  return subtask;
};

export const updateBatchSubtaskService = async (newData: BatchSubtaskInput): Promise<Subtask[]> => {
  const res = await axios.patch(
    `${HOST}/api/v1/subtasks/update-batch`,
    newData
  );
  const result: SubtaskData[] = res.data.data;
  const subtasks: Subtask[] = result.map((i: SubtaskData) => {
    return {
      id: i.id,
      ...i.attributes,
      todoId: i.attributes.todoId.toString()
    };
  });
  return subtasks;
};

export const updateTaskService = async (
  taskId: string,
  newData: SubtaskInput
): Promise<TaskResponse> => {
  const res = await axios.patch(`${HOST}/api/v1/todos/${taskId}`, newData);
  const result: TaskResponse = res.data.data;
  return result;
};
