import { Server as SocketIOServer } from "socket.io";
import { Task, Schedule } from "@prisma/client";

export function setupSocketEvents(io: SocketIOServer) {
  // Emit task creation to user room
  function emitTaskCreated(
    userId: number,
    task: Task & { category?: { name: string } },
  ) {
    io.to(`user-${userId}`).emit("task:created", task);
    console.log(`Emitted task:created to user-${userId}`);
  }

  // Emit task update to user room
  function emitTaskUpdated(userId: number, task: Task) {
    io.to(`user-${userId}`).emit("task:updated", task);
    console.log(`Emitted task:updated to user-${userId}`);
  }

  // Emit task deletion to user room
  function emitTaskDeleted(userId: number, taskId: number) {
    io.to(`user-${userId}`).emit("task:deleted", { id: taskId });
    console.log(`Emitted task:deleted to user-${userId}`);
  }

  // Emit schedule creation to user room
  function emitScheduleCreated(
    userId: number,
    schedule: Schedule & { task?: Task },
  ) {
    io.to(`user-${userId}`).emit("schedule:created", schedule);
    console.log(`Emitted schedule:created to user-${userId}`);
  }

  // Emit schedule update to user room
  function emitScheduleUpdated(
    userId: number,
    schedule: Schedule & { task?: Task },
  ) {
    io.to(`user-${userId}`).emit("schedule:updated", schedule);
    console.log(`Emitted schedule:updated to user-${userId}`);
  }

  // Emit schedule deletion to user room
  function emitScheduleDeleted(userId: number, scheduleId: number) {
    io.to(`user-${userId}`).emit("schedule:deleted", { id: scheduleId });
    console.log(`Emitted schedule:deleted to user-${userId}`);
  }

  // Emit stats update to user room
  function emitStatsUpdated(userId: number, stats: any) {
    io.to(`user-${userId}`).emit("stats:updated", stats);
    console.log(`Emitted stats:updated to user-${userId}`);
  }

  return {
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskDeleted,
    emitScheduleCreated,
    emitScheduleUpdated,
    emitScheduleDeleted,
    emitStatsUpdated,
  };
}
