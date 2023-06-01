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