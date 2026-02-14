import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  UserProfile,
  NNSState,
  NNSMaturity,
  FullNNSData,
  Bill,
  Payment,
  BillSummary,
  HorseBet,
  BetStats,
  Task,
  Habit,
  Plan,
} from '../backend';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// NNS State Queries
export function useGetNNSState() {
  const { actor, isFetching } = useActor();

  return useQuery<NNSState>({
    queryKey: ['nnsState'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getNNSState();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateNNSState() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (state: NNSState) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateNNSState(state);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nnsState'] });
      queryClient.invalidateQueries({ queryKey: ['fullNNSData'] });
    },
  });
}

// NNS Maturity Queries
export function useGetNNSMaturity() {
  const { actor, isFetching } = useActor();

  return useQuery<NNSMaturity>({
    queryKey: ['nnsMaturity'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getNNSMaturity();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateNNSMaturity() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (maturity: NNSMaturity) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateNNSMaturity(maturity);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nnsMaturity'] });
      queryClient.invalidateQueries({ queryKey: ['fullNNSData'] });
    },
  });
}

// Full NNS Data Query
export function useGetFullNNSData() {
  const { actor, isFetching } = useActor();

  return useQuery<FullNNSData>({
    queryKey: ['fullNNSData'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getFullNNSData();
    },
    enabled: !!actor && !isFetching,
  });
}

// Bill Tracker Queries
export function useGetBills() {
  const { actor, isFetching } = useActor();

  return useQuery<Bill[]>({
    queryKey: ['bills'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBills();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bill: Bill) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBill(bill);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['billSummary'] });
    },
  });
}

export function useEditBill() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ billId, updatedBill }: { billId: bigint; updatedBill: Bill }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.editBill(billId, updatedBill);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['billSummary'] });
    },
  });
}

export function useAddPayment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payment: Payment) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPayment(payment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['billSummary'] });
    },
  });
}

export function useGetBillSummary() {
  const { actor, isFetching } = useActor();

  return useQuery<BillSummary>({
    queryKey: ['billSummary'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBillSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

// Horse Bets Queries
export function useGetHorseBets() {
  const { actor, isFetching } = useActor();

  return useQuery<HorseBet[]>({
    queryKey: ['horseBets'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getHorseBets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddHorseBet() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bet: HorseBet) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addHorseBet(bet);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['horseBets'] });
      queryClient.invalidateQueries({ queryKey: ['betStats'] });
    },
  });
}

export function useGetBetStats() {
  const { actor, isFetching } = useActor();

  return useQuery<BetStats>({
    queryKey: ['betStats'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBetStats();
    },
    enabled: !!actor && !isFetching,
  });
}

// Task Queries
export function useGetTasks() {
  const { actor, isFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: Task) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addTask(task);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCompleteTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.completeTask(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

// Habit Queries
export function useGetHabits() {
  const { actor, isFetching } = useActor();

  return useQuery<Habit[]>({
    queryKey: ['habits'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getHabits();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddHabit() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (habit: Habit) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addHabit(habit);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

export function useUpdateHabitProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, progress }: { habitId: bigint; progress: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateHabitProgress(habitId, progress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['habits'] });
    },
  });
}

// Plan Queries
export function useGetPlans() {
  const { actor, isFetching } = useActor();

  return useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPlans();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (plan: Plan) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addPlan(plan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

export function useUpdatePlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ planId, updatedPlan }: { planId: bigint; updatedPlan: Plan }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePlan(planId, updatedPlan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}

export function useDeletePlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deletePlan(planId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });
}
