// 1. build an automaton that picks up and drops off parcels

// Meadowfield consist of 11 places w/ 14 roads
// starting location, ending location (from, to then turns into--> place, address)
// 1st global
// const roads = [
//   "Alice's House-Bob's House",   "Alice's House-Cabin",
//   "Alice's House-Post Office",   "Bob's House-Town Hall",
//   "Daria's House-Ernie's House", "Daria's House-Town Hall",
//   "Ernie's House-Grete's House", "Grete's House-Farm",
//   "Grete's House-Shop",          "Marketplace-Farm",
//   "Marketplace-Post Office",     "Marketplace-Shop",
//   "Marketplace-Town Hall",       "Shop-Town Hall"
// ];

// parcels = tasks

// Q: what destinations can be reached from a given place
  // edges are in an array

  // buildGraph creates a map object for each node and stores an array of connected nodes
  // using the split method to go from rth road strings
  // Start-End, to two element arrays
  // edges = roads (starting point to ending point, always one direction)
  // function buildGraph(edges) {
  // let graph = Object.create(null);
  // // in js all functions are function objects(w/ variable names)
  // // scoped within addEdge
  // function addEdge(from, to) {
  //   // store the 1st location(from), if no value provided, create a to array
  //   if (graph[from] == null) {
  //     graph[from] = [to];
  //     // otherwise just add from to the to array
  //   } else {
  //     graph[from].push(to);
  //   }
  // }
  // traverse all directions each way
  // r is short for road
  // map iterates over an array, and for each element calls a fn()(could also use forEach)
  // for (let [from, to] of edges.map(r => r.split("-"))) {
  //   addEdge(from, to);
  //   addEdge(to, from);
  // }
  // my graph database is returned
//   return graph;
// }
// 2nd global
// var roadGraph = buildGraph(roads);

// the code:
// 1st global
var roads = [
  "Alice's House-Bob's House",   "Alice's House-Cabin",
  "Alice's House-Post Office",   "Bob's House-Town Hall",
  "Daria's House-Ernie's House", "Daria's House-Town Hall",
  "Ernie's House-Grete's House", "Grete's House-Farm",
  "Grete's House-Shop",          "Marketplace-Farm",
  "Marketplace-Post Office",     "Marketplace-Shop",
  "Marketplace-Town Hall",       "Shop-Town Hall"
];

function buildGraph(edges) {
  let graph = Object.create(null);
  function addEdge(from, to) {
    if (graph[from] == null) {
      graph[from] = [to];
    } else {
      graph[from].push(to);
    }
  }
  for (let [from, to] of edges.map(r => r.split("-"))) {
    addEdge(from, to);
    addEdge(to, from);
  }
  return graph;
}
// 2nd global
var roadGraph = buildGraph(roads);

// class represents where we are and where we're going
var VillageState = class VillageState {
  // object constructor, sets up the state
  constructor(place, parcels) {
    this.place = place;
    this.parcels = parcels;
  }
// method - gets a this(object's state)
// this is where the action happens
// move method gives a new village state
  move(destination) {
    // is there a road going from current place to the destination,
    if (!roadGraph[this.place].includes(destination)) {
      // if not return to old state(not valid move)
      return this;
    } else {
      // array of objects
      let parcels = this.parcels.map(p => {
        // parcels is an object (p)
        if (p.place != this.place) return p;
        // place= from, address = to(next delivery/task)
        return {place: destination, address: p.address};
        // create a new array w/
      }).filter(p => p.place != p.address);
      return new VillageState(destination, parcels);
    }
  }
}

// robot returns and object containing the direction for next move
// 3 parameters
// robot is a function
// and a memory(state of robot, history) value that can be returned when called
// state(delivery state)
function runRobot(state, robot, memory) {
  for (let turn = 0;; turn++) {
    if (state.parcels.length == 0) {
      console.log(`Done in ${turn} turns`);
      break;
    }
    let action = robot(state, memory);
    // state = villageState object
    state = state.move(action.direction);
    // action is an object (given state and memory)
    memory = action.memory;
    console.log(`Moved to ${action.direction}`);
  }
}
// pick a route, randomly
function randomPick(array) {
  let choice = Math.floor(Math.random() * array.length);
  return array[choice];
}

function randomRobot(state) {
  return {direction: randomPick(roadGraph[state.place])};
}

VillageState.random = function(parcelCount = 5) {
  let parcels = [];
  for (let i = 0; i < parcelCount; i++) {
    let address = randomPick(Object.keys(roadGraph));
    let place;
    do {
      place = randomPick(Object.keys(roadGraph));
    } while (place == address);
    parcels.push({place, address});
  }
  return new VillageState("Post Office", parcels);
};

// =================================
// route for route Robot
var mailRoute = [
  "Alice's House", "Cabin", "Alice's House", "Bob's House",
  "Town Hall", "Daria's House", "Ernie's House",
  "Grete's House", "Shop", "Grete's House", "Farm",
  "Marketplace", "Post Office"
];

function routeRobot(state, memory) {
  if (memory.length == 0) {
    memory = mailRoute;
  }
  return {direction: memory[0], memory: memory.slice(1)};
}
// find the shortest route
function findRoute(graph, from, to) {
  // order of first visited (store places that need to be visited next, along with the route that got us there)
  // start with start position then the next list item, if the next item is the goal
  let work = [{at: from, route: []}];
  for (let i = 0; i < work.length; i++) {
    let {at, route} = work[i];
    for (let place of graph[at]) {
      if (place == to) return route.concat(place);
      if (!work.some(w => w.at == place)) {
        work.push({at: place, route: route.concat(place)});
      }
    }
  }
}

function goalOrientedRobot({place, parcels}, route) {
  if (route.length == 0) {
    let parcel = parcels[0];
    // 1st task, if that place and current place are the same don't move
    if (parcel.place != place) {
      route = findRoute(roadGraph, place, parcel.place);
    } else {
      route = findRoute(roadGraph, place, parcel.address);
    }
  }
  return {direction: route[0], memory: route.slice(1)};
}

runRobot(VillageState.random(),  goalOrientedRobot, []);

// Part 2:
function lazyRobot({place, parcels}, route) {
  if (route.length == 0) {
    // Describe a route for every parcel
    let routes = parcels.map(parcel => {
      if (parcel.place != place) {
        return {route: findRoute(roadGraph, place, parcel.place),
                pickUp: true};
      } else {
        return {route: findRoute(roadGraph, place, parcel.address),
                pickUp: false};
      }
    });

    // This determines the precedence a route gets when choosing.
    // Route length counts negatively, routes that pick up a package
    // get a small bonus.
    function score({route, pickUp}) {
      return (pickUp ? 0.5 : 0) - route.length;
    }
    route = routes.reduce((a, b) => score(a) > score(b) ? a : b).route;
  }

  return {direction: route[0], memory: route.slice(1)};
}

runRobotAnimation(VillageState.random(), lazyRobot, []);
