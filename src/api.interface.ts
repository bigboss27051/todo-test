export interface TaskResponse {
    type: string
    id: string
    attributes: TaskAttributes
    relationships: Relationships
  }
  
  export interface TaskAttributes {
    title: string
    createAt: string
    status: string
  }
  
  export interface Relationships {
    subtask: Subtask
  }
  
  export interface Subtask {
    data: SubtaskData[]
  }
  
  export interface SubtaskData {
    type: string
    id: string
    attributes: SubtaskAttributes
  }
  
  export interface SubtaskAttributes {
    title: string
    createAt: string
    status: string
    todoId: number
  }

  export interface SubtaskInput {
    id?: string;
    title?: string;
    status?: string;
    todoId?: string;
  }

  export interface BatchSubtaskInput {
    batchIds: number[];
    data: SubtaskInput;
  }
  
  export interface TaskInput {
    id?: string;
    title?: string;
    status?: string;
    subtasks?: Subtask[];
  }