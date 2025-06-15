import { TaskStatus } from "@/common/enums"
import { useGetTasksQuery } from "@/features/todolists/api/tasksApi"
import type { DomainTodolist } from "@/features/todolists/lib/types"
import { TaskItem } from "./TaskItem/TaskItem"
import { TasksSkeleton } from "./TasksSkeleton/TasksSkeleton"
import { TasksPagination } from "./TasksPagination/TasksPagination"
import { useState } from "react"
import { PAGE_SIZE } from "@/common/constants"
import List from "@mui/material/List"

type Props = {
  todolist: DomainTodolist
}

export const Tasks = ({ todolist }: Props) => {
  const { id, filter } = todolist
  const [page, setPage] = useState<number>(1)

  const { data, isLoading } = useGetTasksQuery({
    todolistId: id,
    params: { page },
  })
  const totalCount = data?.totalCount || 0
  const lastTask = data?.items.length

  let filteredTasks = data?.items
  if (filter === "active") {
    filteredTasks = filteredTasks?.filter((task) => task.status === TaskStatus.New)
  }
  if (filter === "completed") {
    filteredTasks = filteredTasks?.filter((task) => task.status === TaskStatus.Completed)
  }

  if (isLoading) {
    return <TasksSkeleton />
    
  }
  return (
    <>
      {filteredTasks?.length === 0 ? (
        <p>Тасок нет</p>
      ) : (
        <>
          <List>{filteredTasks?.map((task) => <TaskItem key={task.id} task={task} todolist={todolist} setPage={setPage} lastTask={lastTask} page={page}/>)}</List>
          { totalCount > PAGE_SIZE
          ? <TasksPagination totalCount={totalCount} page={page} setPage={setPage} />
          : <></>
        }
        </>
      )}
    </>
  )
}
