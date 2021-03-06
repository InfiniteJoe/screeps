var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleAttacker = require('role.attacker');
var flagHandler = require('flag.handler');
var squadsHandler = require('squads.handler');
var roleAttacker_Ranged = require('role.attacker_ranged');
var operationsHandler = require('operations.handler');

MAX_HARVESTERS=10
MAX_BUILDERS=5
MAX_UPGRADERS=5
MIN_BUILDERS=1
MIN_UPGRADERS=1
MIN_HARVESTERS=5
ACC_CPU=0
var WORKER_PRESETS = [[CARRY,MOVE,WORK],[WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE]];
var MINER_PRESETS = [MOVE,WORK,WORK,WORK]
//Lets first add a shortcut prototype to the sources memory:
Source.prototype.memory = undefined;





module.exports.loop = function () {
    var hostiles=Game.spawns['Spawn1'].room.find(FIND_HOSTILE_CREEPS);
    if(hostiles.length>0){
        //Game.spawns['Spawn1'].room.controller.activateSafeMode();
    }
    for(var roomName in Game.rooms){//Loop through all rooms your creeps/structures are in
        var room = Game.rooms[roomName];
        if(!room.memory.sources){//If this room has no sources memory yet
            room.memory.sources = {}; //Add it
            var sources = room.find(FIND_SOURCES);//Find all sources in the current room
            for(var i in sources){
                var source = sources[i];
                source.memory = room.memory.sources[source.id] = {}; //Create a new empty memory object for this source
                //Now you can do anything you want to do with this source
                //for example you could add a worker counter:
                source.memory.workers = 0;
                source.memory.efficiency =0;
            }
        }

    }
    if(!Memory.squads){
        Memory.squads={};
    }
    flagHandler.run();

    operationsHandler.run();





    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');

    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');

    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');

    for(var name in Game.rooms) {
    var structures = Game.rooms[name].find(FIND_STRUCTURES,{filter: (structure) => structure.structureType == STRUCTURE_TOWER});
        for( i in structures){
            if(structures[i]) {


                var closestHostile = structures[i].pos.findClosestByRange(FIND_HOSTILE_CREEPS,{filter: (creep) => (_.filter(creep.body,(body) => body.type == 'attack')).length >0 && (_.filter(creep.body,(body) => body.type == 'work')).length >0});
                if(closestHostile) {
                    structures[i].attack(closestHostile);
                }else{
                    var closestDamagedStructure = structures[i].pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => (structure.hits < structure.hitsMax && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART)
                    });
                    if(closestDamagedStructure) {
                        structures[i].repair(closestDamagedStructure);
                }
                }


            }
        }





    if(Game.time % 5 == 0){

        //Berechne Effizienz

        var energyRatio = Game.rooms[name].energyAvailable/Game.rooms[name].energyCapacityAvailable;


        if(harvesters.length < MAX_HARVESTERS && Game.rooms[name].energyAvailable  && Game.spawns['Spawn1'].canCreateCreep(WORKER_PRESETS[Game.rooms[name].memory.defaultworker], undefined, {role: 'harvester'}) == 0){
            var newName = Game.spawns['Spawn1'].createCreep(WORKER_PRESETS[Game.rooms[name].memory.defaultworker], undefined, {role: 'harvester'});
            console.log('Spawning new harvester: ' + newName);
        }


        console.log('Room "'+name+'" has  Energy: '+Game.rooms[name].energyAvailable+' Harvesters: '+harvesters.length+' Current Workerpreset '+ WORKER_PRESETS[Game.rooms[name].memory.defaultworker]);

    }
    }
    squadsHandler.run();


    for(var name in Game.creeps) {



        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
    }




    //var temp=Game.cpu.getUsed();
    //console.log('CPU Used: '+ temp);
}