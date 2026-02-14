import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import List "mo:core/List";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

// Specify migration directive and enable authorization
(with migration = Migration.run)
actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
    email : ?Text;
  };

  // NNS Progress Data Types
  public type NNSState = {
    stakedICP : Float;
    lastUpdated : Time.Time;
  };

  public type NNSMaturity = {
    earned : Float;
    earnedPerDay : Float;
    lastUpdated : Time.Time;
  };

  public type FullNNSData = {
    nnsState : NNSState;
    maturity : NNSMaturity;
  };

  // Bill/Debt Tracker Types
  public type Bill = {
    id : Nat;
    title : Text;
    totalAmount : Float;
    description : Text;
    createdAt : Time.Time;
    isPaid : Bool;
    remainingBalance : Float;
  };

  public type Payment = {
    id : Nat;
    billId : Nat;
    amount : Float;
    timestamp : Time.Time;
  };

  public type BillSummary = {
    totalOwed : Float;
    totalPaid : Float;
    totalRemaining : Float;
    numBills : Nat;
    numPaid : Nat;
    numUnpaid : Nat;
  };

  // Horse Bets Data Types
  public type HorseBet = {
    id : Nat;
    amount : Float;
    horseName : Text;
    odds : Float;
    isWin : Bool;
    timestamp : Time.Time;
  };

  public type BetStats = {
    totalBets : Nat;
    totalAmount : Float;
    totalWins : Nat;
    totalLosses : Nat;
    profitLoss : Float;
  };

  // To-Do List Data Types
  public type Task = {
    id : Nat;
    title : Text;
    description : Text;
    isComplete : Bool;
    priority : Nat;
    category : Text;
    timestamp : Time.Time;
  };

  // Habit Tracker Data Types
  public type Habit = {
    id : Nat;
    name : Text;
    goal : Nat;
    progress : Nat;
    streak : Nat;
    lastUpdated : Time.Time;
  };

  // New Lightweight Plan Data Types
  public type Plan = {
    id : Nat;
    title : Text;
    notes : Text;
    links : [Text];
    timestamp : Time.Time;
  };

  // Persistent Storage
  let userProfiles = Map.empty<Principal, UserProfile>();
  let nnsStates = Map.empty<Principal, NNSState>();
  let nnsMaturities = Map.empty<Principal, NNSMaturity>();
  let bills = Map.empty<Principal, List.List<Bill>>();
  let payments = Map.empty<Principal, List.List<Payment>>();
  let horseBets = Map.empty<Principal, List.List<HorseBet>>();
  let tasks = Map.empty<Principal, List.List<Task>>();
  let habits = Map.empty<Principal, List.List<Habit>>();
  let plans = Map.empty<Principal, List.List<Plan>>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // NNS Progress Functions
  public query ({ caller }) func getNNSState() : async NNSState {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view NNS state");
    };
    switch (nnsStates.get(caller)) {
      case (null) {
        {
          stakedICP = 0.0;
          lastUpdated = Time.now();
        };
      };
      case (?state) { state };
    };
  };

  public shared ({ caller }) func updateNNSState(state : NNSState) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update NNS state");
    };
    nnsStates.add(caller, {
      stakedICP = state.stakedICP;
      lastUpdated = Time.now();
    });
  };

  public shared ({ caller }) func updateNNSMaturity(maturity : NNSMaturity) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update NNS maturity");
    };
    nnsMaturities.add(caller, {
      earned = maturity.earned;
      earnedPerDay = maturity.earnedPerDay;
      lastUpdated = Time.now();
    });
  };

  public query ({ caller }) func getNNSMaturity() : async NNSMaturity {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view NNS maturity");
    };
    switch (nnsMaturities.get(caller)) {
      case (null) {
        {
          earned = 0.0;
          earnedPerDay = 0.0;
          lastUpdated = Time.now();
        };
      };
      case (?maturity) { maturity };
    };
  };

  public query ({ caller }) func getFullNNSData() : async FullNNSData {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view full NNS data");
    };
    let nnsState = switch (nnsStates.get(caller)) {
      case (null) {
        {
          stakedICP = 0.0;
          lastUpdated = Time.now();
        };
      };
      case (?s) { s };
    };
    let maturity = switch (nnsMaturities.get(caller)) {
      case (null) {
        {
          earned = 0.0;
          earnedPerDay = 0.0;
          lastUpdated = Time.now();
        };
      };
      case (?m) { m };
    };
    {
      nnsState;
      maturity;
    };
  };

  // Bill Tracker Functions
  public query ({ caller }) func getBills() : async [Bill] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bills");
    };
    switch (bills.get(caller)) {
      case (null) { [] };
      case (?billList) { billList.toArray() };
    };
  };

  public shared ({ caller }) func addBill(bill : Bill) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add bills");
    };
    let currentBills = switch (bills.get(caller)) {
      case (null) { List.empty<Bill>() };
      case (?billList) { billList };
    };
    currentBills.add(bill);
    bills.add(caller, currentBills);
  };

  public shared ({ caller }) func addPayment(payment : Payment) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add payments");
    };

    // Add payment to payments list
    let currentPayments = switch (payments.get(caller)) {
      case (null) { List.empty<Payment>() };
      case (?paymentList) { paymentList };
    };
    currentPayments.add(payment);
    payments.add(caller, currentPayments);

    // Update bill's remaining balance
    let currentBills = switch (bills.get(caller)) {
      case (null) { List.empty<Bill>() };
      case (?billList) { billList };
    };

    let updatedBills = currentBills.toArray().map(
      func(bill) {
        if (bill.id == payment.billId) {
          let totalPayments = getBillPaymentsTotal(caller, payment.billId);
          {
            id = bill.id;
            title = bill.title;
            totalAmount = bill.totalAmount;
            description = bill.description;
            createdAt = bill.createdAt;
            isPaid = totalPayments >= bill.totalAmount;
            remainingBalance = if (totalPayments >= bill.totalAmount) {
              0.0;
            } else {
              bill.totalAmount - totalPayments;
            };
          };
        } else {
          bill;
        };
      }
    );
    bills.add(caller, List.fromArray<Bill>(updatedBills));
  };

  public shared ({ caller }) func editBill(billId : Nat, updatedBill : Bill) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can edit bills");
    };

    let currentBills = switch (bills.get(caller)) {
      case (null) { List.empty<Bill>() };
      case (?billList) { billList };
    };

    let updatedBills = currentBills.toArray().map(
      func(bill) {
        if (bill.id == billId) {
          let totalPayments = getBillPaymentsTotal(caller, billId);
          {
            id = bill.id;
            title = updatedBill.title;
            totalAmount = updatedBill.totalAmount;
            description = updatedBill.description;
            createdAt = bill.createdAt;
            isPaid = totalPayments >= updatedBill.totalAmount;
            remainingBalance = if (totalPayments >= updatedBill.totalAmount) {
              0.0;
            } else {
              updatedBill.totalAmount - totalPayments;
            };
          };
        } else {
          bill;
        };
      }
    );
    bills.add(caller, List.fromArray<Bill>(updatedBills));
  };

  func getBillPaymentsTotal(caller : Principal, billId : Nat) : Float {
    switch (payments.get(caller)) {
      case (null) { 0.0 };
      case (?payList) {
        var total : Float = 0.0;
        for (payment in payList.values()) {
          if (payment.billId == billId) {
            total += payment.amount;
          };
        };
        total;
      };
    };
  };

  public query ({ caller }) func getBillPayments(billId : Nat) : async [Payment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bill payments");
    };
    switch (payments.get(caller)) {
      case (null) { [] };
      case (?payList) {
        payList.filter(func(p) { p.billId == billId }).toArray();
      };
    };
  };

  public query ({ caller }) func getBillSummary() : async BillSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bill summary");
    };
    let billList = switch (bills.get(caller)) {
      case (null) { List.empty<Bill>() };
      case (?bills) { bills };
    };

    var totalOwed : Float = 0.0;
    var totalPaid : Float = 0.0;
    var totalRemaining : Float = 0.0;
    var numPaid : Nat = 0;
    var numUnpaid : Nat = 0;

    for (bill in billList.values()) {
      totalOwed += bill.totalAmount;
      totalRemaining += bill.remainingBalance;
      totalPaid += (bill.totalAmount - bill.remainingBalance);
      if (bill.isPaid) {
        numPaid += 1;
      } else {
        numUnpaid += 1;
      };
    };

    {
      totalOwed;
      totalPaid;
      totalRemaining;
      numBills = billList.size();
      numPaid;
      numUnpaid;
    };
  };

  // Horse Bets Functions
  public query ({ caller }) func getHorseBets() : async [HorseBet] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view horse bets");
    };
    switch (horseBets.get(caller)) {
      case (null) { [] };
      case (?betList) { betList.toArray() };
    };
  };

  public shared ({ caller }) func addHorseBet(bet : HorseBet) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add horse bets");
    };
    let currentBets = switch (horseBets.get(caller)) {
      case (null) { List.empty<HorseBet>() };
      case (?betList) { betList };
    };
    currentBets.add(bet);
    horseBets.add(caller, currentBets);
  };

  public query ({ caller }) func getBetStats() : async BetStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bet stats");
    };
    let bets = switch (horseBets.get(caller)) {
      case (null) { List.empty<HorseBet>() };
      case (?bets) { bets };
    };

    var totalBets : Nat = 0;
    var totalAmount : Float = 0.0;
    var totalWins : Nat = 0;
    var totalLosses : Nat = 0;
    var profitLoss : Float = 0.0;

    for (bet in bets.values()) {
      totalBets += 1;
      totalAmount += bet.amount;
      if (bet.isWin) {
        totalWins += 1;
        profitLoss += bet.amount * bet.odds - bet.amount;
      } else {
        totalLosses += 1;
        profitLoss -= bet.amount;
      };
    };

    {
      totalBets;
      totalAmount;
      totalWins;
      totalLosses;
      profitLoss;
    };
  };

  // To-Do List Functions
  public query ({ caller }) func getTasks() : async [Task] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view tasks");
    };
    switch (tasks.get(caller)) {
      case (null) { [] };
      case (?taskList) { taskList.toArray() };
    };
  };

  public shared ({ caller }) func addTask(task : Task) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add tasks");
    };
    let currentTasks = switch (tasks.get(caller)) {
      case (null) { List.empty<Task>() };
      case (?taskList) { taskList };
    };
    currentTasks.add(task);
    tasks.add(caller, currentTasks);
  };

  public shared ({ caller }) func completeTask(taskId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete tasks");
    };
    switch (tasks.get(caller)) {
      case (null) { () };
      case (?taskList) {
        let updatedTasks = taskList.toArray().map(
          func(task) {
            if (task.id == taskId) {
              {
                id = task.id;
                title = task.title;
                description = task.description;
                isComplete = true;
                priority = task.priority;
                category = task.category;
                timestamp = task.timestamp;
              };
            } else {
              task;
            };
          }
        );
        tasks.add(caller, List.fromArray<Task>(updatedTasks));
      };
    };
  };

  // Habit Tracker Functions
  public query ({ caller }) func getHabits() : async [Habit] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view habits");
    };
    switch (habits.get(caller)) {
      case (null) { [] };
      case (?habitList) { habitList.toArray() };
    };
  };

  public shared ({ caller }) func addHabit(habit : Habit) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add habits");
    };
    let currentHabits = switch (habits.get(caller)) {
      case (null) { List.empty<Habit>() };
      case (?habitList) { habitList };
    };
    currentHabits.add(habit);
    habits.add(caller, currentHabits);
  };

  public shared ({ caller }) func updateHabitProgress(habitId : Nat, progress : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update habit progress");
    };
    switch (habits.get(caller)) {
      case (null) { () };
      case (?habitList) {
        let updatedHabits = habitList.toArray().map(
          func(habit) {
            if (habit.id == habitId) {
              {
                id = habit.id;
                name = habit.name;
                goal = habit.goal;
                progress;
                streak = if (progress == habit.goal) { habit.streak + 1 } else { 0 };
                lastUpdated = Time.now();
              };
            } else {
              habit;
            };
          }
        );
        habits.add(caller, List.fromArray<Habit>(updatedHabits));
      };
    };
  };

  // New Plan Functions
  public query ({ caller }) func getPlans() : async [Plan] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view plans");
    };
    switch (plans.get(caller)) {
      case (null) { [] };
      case (?plansList) { plansList.toArray() };
    };
  };

  public shared ({ caller }) func addPlan(plan : Plan) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add plans");
    };
    let currentPlans = switch (plans.get(caller)) {
      case (null) { List.empty<Plan>() };
      case (?plansList) { plansList };
    };
    currentPlans.add(plan);
    plans.add(caller, currentPlans);
  };

  public shared ({ caller }) func updatePlan(planId : Nat, updatedPlan : Plan) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update plans");
    };

    let currentPlans = switch (plans.get(caller)) {
      case (null) { List.empty<Plan>() };
      case (?plansList) { plansList };
    };

    let updatedPlans = currentPlans.toArray().map(
      func(plan) {
        if (plan.id == planId) {
          {
            id = plan.id;
            title = updatedPlan.title;
            notes = updatedPlan.notes;
            links = updatedPlan.links;
            timestamp = plan.timestamp;
          };
        } else {
          plan;
        };
      }
    );
    plans.add(caller, List.fromArray<Plan>(updatedPlans));
  };

  public shared ({ caller }) func deletePlan(planId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete plans");
    };

    switch (plans.get(caller)) {
      case (null) { () };
      case (?plansList) {
        let filteredPlans = plansList.filter(
          func(plan) { plan.id != planId }
        );
        plans.add(caller, filteredPlans);
      };
    };
  };

  // HTTP Outcall for NNS Live Data
  // NOTE: Transform function must be public without authorization checks
  // as it is called by the IC system during HTTP outcalls
  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func fetchNNSLiveData(url : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can fetch NNS live data");
    };
    await OutCall.httpGetRequest(url, [], transform);
  };
};
