import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Plan {
    id: bigint;
    title: string;
    links: Array<string>;
    notes: string;
    timestamp: Time;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface HorseBet {
    id: bigint;
    odds: number;
    horseName: string;
    timestamp: Time;
    isWin: boolean;
    amount: number;
}
export interface Task {
    id: bigint;
    title: string;
    description: string;
    timestamp: Time;
    category: string;
    priority: bigint;
    isComplete: boolean;
}
export interface Habit {
    id: bigint;
    streak: bigint;
    goal: bigint;
    name: string;
    lastUpdated: Time;
    progress: bigint;
}
export interface Payment {
    id: bigint;
    timestamp: Time;
    amount: number;
    billId: bigint;
}
export interface BillSummary {
    numUnpaid: bigint;
    totalOwed: number;
    totalPaid: number;
    numBills: bigint;
    totalRemaining: number;
    numPaid: bigint;
}
export interface NNSMaturity {
    earnedPerDay: number;
    lastUpdated: Time;
    earned: number;
}
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface http_header {
    value: string;
    name: string;
}
export interface NNSState {
    lastUpdated: Time;
    stakedICP: number;
}
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Bill {
    id: bigint;
    title: string;
    createdAt: Time;
    description: string;
    isPaid: boolean;
    remainingBalance: number;
    totalAmount: number;
}
export interface BetStats {
    totalLosses: bigint;
    totalBets: bigint;
    profitLoss: number;
    totalWins: bigint;
    totalAmount: number;
}
export interface FullNNSData {
    maturity: NNSMaturity;
    nnsState: NNSState;
}
export interface UserProfile {
    name: string;
    email?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBill(bill: Bill): Promise<void>;
    addHabit(habit: Habit): Promise<void>;
    addHorseBet(bet: HorseBet): Promise<void>;
    addPayment(payment: Payment): Promise<void>;
    addPlan(plan: Plan): Promise<void>;
    addTask(task: Task): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeTask(taskId: bigint): Promise<void>;
    deletePlan(planId: bigint): Promise<void>;
    editBill(billId: bigint, updatedBill: Bill): Promise<void>;
    fetchNNSLiveData(url: string): Promise<string>;
    getBetStats(): Promise<BetStats>;
    getBillPayments(billId: bigint): Promise<Array<Payment>>;
    getBillSummary(): Promise<BillSummary>;
    getBills(): Promise<Array<Bill>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFullNNSData(): Promise<FullNNSData>;
    getHabits(): Promise<Array<Habit>>;
    getHorseBets(): Promise<Array<HorseBet>>;
    getNNSMaturity(): Promise<NNSMaturity>;
    getNNSState(): Promise<NNSState>;
    getPlans(): Promise<Array<Plan>>;
    getTasks(): Promise<Array<Task>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateHabitProgress(habitId: bigint, progress: bigint): Promise<void>;
    updateNNSMaturity(maturity: NNSMaturity): Promise<void>;
    updateNNSState(state: NNSState): Promise<void>;
    updatePlan(planId: bigint, updatedPlan: Plan): Promise<void>;
}
