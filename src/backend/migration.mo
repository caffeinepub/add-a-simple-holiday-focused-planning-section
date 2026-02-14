import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Time "mo:core/Time";

module {
  // Old Types
  type OldPlanning = {
    id : Nat;
    location : Text;
    startDate : Time.Time;
    endDate : Time.Time;
    participants : [Text];
    budget : Float;
    notes : Text;
    isConfirmed : Bool;
    createdAt : Time.Time;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text; email : ?Text }>;
    nnsStates : Map.Map<Principal, { stakedICP : Float; lastUpdated : Time.Time }>;
    nnsMaturities : Map.Map<Principal, { earned : Float; earnedPerDay : Float; lastUpdated : Time.Time }>;
    bills : Map.Map<Principal, List.List<{
      id : Nat;
      title : Text;
      totalAmount : Float;
      description : Text;
      createdAt : Time.Time;
      isPaid : Bool;
      remainingBalance : Float;
    }>>;
    payments : Map.Map<Principal, List.List<{
      id : Nat;
      billId : Nat;
      amount : Float;
      timestamp : Time.Time;
    }>>;
    horseBets : Map.Map<Principal, List.List<{
      id : Nat;
      amount : Float;
      horseName : Text;
      odds : Float;
      isWin : Bool;
      timestamp : Time.Time;
    }>>;
    tasks : Map.Map<Principal, List.List<{
      id : Nat;
      title : Text;
      description : Text;
      isComplete : Bool;
      priority : Nat;
      category : Text;
      timestamp : Time.Time;
    }>>;
    habits : Map.Map<Principal, List.List<{
      id : Nat;
      name : Text;
      goal : Nat;
      progress : Nat;
      streak : Nat;
      lastUpdated : Time.Time;
    }>>;
    plannings : Map.Map<Principal, List.List<OldPlanning>>;
  };

  // New Types
  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text; email : ?Text }>;
    nnsStates : Map.Map<Principal, { stakedICP : Float; lastUpdated : Time.Time }>;
    nnsMaturities : Map.Map<Principal, { earned : Float; earnedPerDay : Float; lastUpdated : Time.Time }>;
    bills : Map.Map<Principal, List.List<{
      id : Nat;
      title : Text;
      totalAmount : Float;
      description : Text;
      createdAt : Time.Time;
      isPaid : Bool;
      remainingBalance : Float;
    }>>;
    payments : Map.Map<Principal, List.List<{
      id : Nat;
      billId : Nat;
      amount : Float;
      timestamp : Time.Time;
    }>>;
    horseBets : Map.Map<Principal, List.List<{
      id : Nat;
      amount : Float;
      horseName : Text;
      odds : Float;
      isWin : Bool;
      timestamp : Time.Time;
    }>>;
    tasks : Map.Map<Principal, List.List<{
      id : Nat;
      title : Text;
      description : Text;
      isComplete : Bool;
      priority : Nat;
      category : Text;
      timestamp : Time.Time;
    }>>;
    habits : Map.Map<Principal, List.List<{
      id : Nat;
      name : Text;
      goal : Nat;
      progress : Nat;
      streak : Nat;
      lastUpdated : Time.Time;
    }>>;
    plans : Map.Map<Principal, List.List<{
      id : Nat;
      title : Text;
      notes : Text;
      links : [Text];
      timestamp : Time.Time;
    }>>;
  };

  // Manual migration for Planning to Plan
  public func run(old : OldActor) : NewActor {
    let newPlans = old.plannings.map<Principal, List.List<OldPlanning>, List.List<{ id : Nat; title : Text; notes : Text; links : [Text]; timestamp : Time.Time }>>(
      func(_principal, oldPlannings) {
        oldPlannings.map(
          func(oldPlan) {
            {
              id = oldPlan.id;
              title = oldPlan.location;
              notes = oldPlan.notes # "-- (Migrated Holiday)" # (if (oldPlan.budget > 0.0) {
                " Budget: " # oldPlan.budget.toText();
              } else { "" });
              links = [];
              timestamp = Time.now();
            };
          }
        );
      }
    );

    {
      old with
      plans = newPlans;
    };
  };
};
