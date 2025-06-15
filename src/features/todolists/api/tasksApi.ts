import { baseApi } from "@/app/baseApi"
import type { BaseResponse } from "@/common/types"
import type { DomainTask, GetTasksResponse, UpdateTaskModel } from "./tasksApi.types"
import { PAGE_SIZE } from "@/common/constants"

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<GetTasksResponse, { todolistId: string; params: { page: number } }>({
      query: ({ todolistId, params }) => ({
        url: `todo-lists/${todolistId}/tasks`,
        params: { ...params, count: PAGE_SIZE },
      }),

      providesTags: (_res, _err, args) => [{ type: "Task", id: args.todolistId }],
    }),
    addTask: build.mutation<BaseResponse<{ item: DomainTask }>, { todolistId: string; title: string }>({
      query: ({ todolistId, title }) => ({
        url: `todo-lists/${todolistId}/tasks`,
        method: "POST",
        body: { title },
      }),
      invalidatesTags: (_res, _err, args) => {
        return [{ type: "Task", id: args.todolistId }]
      },
    }),
    removeTask: build.mutation<BaseResponse, { todolistId: string; taskId: string }>({
      query: ({ todolistId, taskId }) => ({
        url: `todo-lists/${todolistId}/tasks/${taskId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, args) => {
        return [{ type: "Task", id: args.todolistId }]
      },
    }),
    updateTask: build.mutation<
      BaseResponse<{ item: DomainTask }>,
      { todolistId: string; taskId: string; model: UpdateTaskModel; page: number }
    >({
      query: ({ todolistId, taskId, model }) => ({
        url: `todo-lists/${todolistId}/tasks/${taskId}`,
        method: "PUT",
        body: model,
      }),
      onQueryStarted: async ({ todolistId, taskId, model, page}, api) => {
        const patchResult = api.dispatch(
          tasksApi.util.updateQueryData("getTasks", { todolistId, params: {page} }, (state) => {
            const index = state.items.findIndex(e => e.id === taskId)
            if (index !== -1) {
              state.items[index] = {...state.items[index], ...model}
            }
          }),
        )
        try {
          await api.queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
      invalidatesTags: (_res, _err, args) => {
        return [{ type: "Task", id: args.todolistId }]
      },
    }),
  }),
})

export const { useGetTasksQuery, useAddTaskMutation, useRemoveTaskMutation, useUpdateTaskMutation } = tasksApi



