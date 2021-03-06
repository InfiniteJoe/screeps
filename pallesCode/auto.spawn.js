var autoMemory        = require('auto.memory');
var constants  = require('var.const');
var creepRole = constants.creepRole();
var maintanceUnits = 1;
var upgradeUnits = 1;


module.exports = {
  /** @param {StructureSpawn} Spawn **/
  run: function(spawnList) {
    
    //for every spawn in the list
    for(var id in spawnList) {
      var spawn = spawnList[id];
        this.roomProfiler(spawn);
      
      if (!spawn.room.memory.activeCreepRoles || !spawn.room.memory.sources){
        autoMemory.resetRoomMemory(spawn.room);
      }
            
      var minerAmount = spawn.room.memory.activeCreepRoles.miner = _.filter(Game.creeps, (creep) => creep.room.name == spawn.room.name && creep.memory.role==creepRole[0].name).length;
      var haulerAmount = spawn.room.memory.activeCreepRoles.hauler = _.filter(Game.creeps, (creep) => creep.room.name == spawn.room.name && creep.memory.role==creepRole[1].name).length;
      var maintanceAmount = spawn.room.memory.activeCreepRoles.maintance = _.filter(Game.creeps, (creep) => creep.room.name == spawn.room.name && creep.memory.role==creepRole[2].name).length;
      var upgraderAmount = spawn.room.memory.activeCreepRoles.upgrader = _.filter(Game.creeps, (creep) => creep.room.name == spawn.room.name && creep.memory.role==creepRole[3].name).length;
      var defenderAmount = spawn.room.memory.activeCreepRoles.defender = _.filter(Game.creeps, (creep) => creep.room.name == spawn.room.name && creep.memory.role==creepRole[4].name).length;
      if(Game.time % 50 == 0){
        console.log("\nSpawn    :"+spawn.name+" energy cap: "+spawn.room.energyCapacityAvailable
                    +"\nMiner    :"+minerAmount+" "+this.minerPreset(spawn)
                    +"\nHauler   :"+haulerAmount+" "+"dynamic part calculation"//+this.haulerPreset(spawn,0)
                    +"\nMaintance:"+maintanceAmount+" "+this.maintancePreset(spawn)
                    +"\nUpgrader :"+upgraderAmount+" "+this.upgraderPreset(spawn)
                    +"\nDefender :"+defenderAmount+" "+this.defenderPreset(spawn));
      }
      
      if (spawn.room.storage == undefined) {
		maintanceUnits = 3*minerAmount;
		upgradeUnits = 1;
	  }else{
	    upgradeUnits = Math.min(Math.max(parseInt(spawn.room.storage.store[RESOURCE_ENERGY]/30000)-4,0),6);
	    maintanceUnits = Math.ceil(1+parseInt(Object.keys(spawn.room.find(FIND_CONSTRUCTION_SITES)).length)/10); // 1 +Constructionsites/10
	  }
      
      //for every type of creep
      var canSpawnMaxModuleCreep = (0 == spawn.canCreateCreep(Array(Game.rooms[spawn.room.name].energyCapacityAvailable/50).fill(MOVE)));
      if ((spawn.room.memory.activeCreepRoles.miner == 0 || spawn.room.memory.activeCreepRoles.hauler == 0) && spawn.room.energyAvailable == 200){
        canSpawnMaxModuleCreep = true;
      }
      for(i=0;i<creepRole.length && Game.rooms[spawn.room.name].energyAvailable;i++){ //&& Game.rooms[spawn.room.name].energyAvailable
        var sources = spawn.room.memory.sources;
        
        if (!spawn.room.memory.activeCreepRoles)
          spawn.room.memory.activeCreepRoles = {}
        //check for amount of creep types in room
        
     
        switch(i) {
          
        case 4: //defender
        if (spawn.room.memory.underAttack && defenderAmount == 0){
          spawn.createCreep(this.defenderPreset(spawn), undefined, {role: creepRole[4].name, job: 'idle', targetId: null});
        }
        break;
          
        case 0: //miner
          if(minerAmount < Object.keys(sources).length){
            for(id in sources){
			  if(!spawn.room.memory.sources[id].requiredCarryParts){
				autoMemory.resetRoomMemory(spawn.room);
			  }
              var found = true;
              //console.log("miner: "+spawn.room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.source == id && creep.memory.role == 'miner'}));
              if(spawn.room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.source == id && creep.memory.role == 'miner' && creep.ticksToLive > 24+2*spawn.room.memory.sources[id].requiredCarryParts}).length == 0 && found){
                spawn.createCreep(this.minerPreset(spawn), undefined, {role: creepRole[0].name, source: id, spawn: true,job: 'idle', targetId: null, containerId: null});
                found = false;
              }
            }
          }
          
          break;
          
        
        case 1: //hauler
          if(minerAmount > haulerAmount && haulerAmount < (Object.keys(sources).length)){
            for(id in sources){
			  if(!spawn.room.memory.sources[id].requiredCarryParts){
				autoMemory.resetRoomMemory(spawn.room);
			  }
              var found = true;
			  //console.log("hauler: "+spawn.room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.source == id && creep.memory.role == 'hauler'}));
              if(spawn.room.find(FIND_MY_CREEPS,{filter: (creep) => creep.memory.source == id && creep.memory.role == 'hauler' && creep.ticksToLive > (6+8*spawn.room.memory.sources[id].requiredCarryParts) }).length == 0 && found){
				  
				//console.log(this.haulerPreset(spawn,spawn.room.memory.sources[id].requiredCarryParts))
                spawn.createCreep(this.haulerPreset(spawn,spawn.room.memory.sources[id].requiredCarryParts), undefined, {role: creepRole[1].name, source: id, spawn:true, job: 'idle', targetId: null});
                found = false;
              }
            }
          }
          break;
          
        case 2: //maintance
        if(minerAmount == (Object.keys(sources).length) && haulerAmount == (Object.keys(sources).length) && maintanceAmount < maintanceUnits){
          spawn.createCreep(this.maintancePreset(spawn), undefined, {role: creepRole[2].name, source: id, spawn:true, job: 'idle', targetId: null});
        }
        break;
        
        case 3: //upgrader
        if(upgraderAmount < upgradeUnits && spawn.room.storage != undefined && minerAmount == Object.keys(sources).length && haulerAmount == Object.keys(sources).length){
          spawn.createCreep(this.upgraderPreset(spawn), undefined, {role: creepRole[3].name, source: id, spawn:true, job: 'idle', workModules: 15, targetId: null});
        }
        break;
      
        
        default:
          console.log("auto.spawn: Undefined creep's role: "+i)
        }
      }
      
      /*
      if(Game.time % 500 == 0){
        this.expand(spawn);
      }
      */
      
    }
  },
  
  minerPreset: function(spawn){
	
    var energyCap = spawn.room.energyCapacityAvailable;
    var moveParts = 1;
    var carryParts= 1;
    var workParts = 2;
	
	if (energyCap >= 950) {moveParts=6;carryParts=1;workParts=6;}
	if (energyCap < 950) {moveParts=1;carryParts=1;workParts=6;}
	if (energyCap < 800) {moveParts=1;carryParts=1;workParts=5;}
	if (energyCap < 700) {moveParts=1;carryParts=1;workParts=4;}
	if (energyCap < 500) {moveParts=2;carryParts=1;workParts=1;}
	
    if (spawn.room.memory.activeCreepRoles.miner == 0 && spawn.room.energyAvailable < energyCap) {moveParts=1;carryParts=1;workParts=2;}
	
    return Array(workParts).fill(WORK).concat(Array(carryParts).fill(CARRY)).concat(Array(moveParts).fill(MOVE));
  },
  haulerPreset: function(spawn,carryCap){
    var energyCap = spawn.room.energyCapacityAvailable;
    var workParts = 1
    if (spawn.room.controller.level > 1)
      workParts = 0
    var moveParts= Math.min(Math.max(1,parseInt(((energyCap-workParts*100)/3)/50)),parseInt(Math.ceil(carryCap/2)));
    var carryParts = parseInt(moveParts*2);
	
	if (energyCap < 500) {
		moveParts=2;carryParts=1;workParts=1;
		return Array(workParts).fill(WORK).concat(Array(carryParts).fill(CARRY)).concat(Array(moveParts).fill(MOVE));
	}else if (spawn.room.memory.activeCreepRoles.hauler == 0 && spawn.room.energyAvailable < energyCap) {
		moveParts=2;carryParts=1;workParts=1;
		return Array(workParts).fill(WORK).concat(Array(carryParts).fill(CARRY)).concat(Array(moveParts).fill(MOVE));
	}else{
		var partArray = [];
		for (let i = 0; i < moveParts; i++){
			partArray = partArray.concat([CARRY,CARRY,MOVE]);
		}
		return partArray;
	}
  },
  maintancePreset: function(spawn){
    var energyCap = spawn.room.energyCapacityAvailable;
    var workParts = Math.min(Math.max(1,parseInt(((energyCap/2)/100))),4);
    var moveParts = Math.max(1,parseInt(((energyCap/4)/50)));
    if (energyCap % 200 != 0) moveParts++;
    if (moveParts > 4) moveParts = 4;
    var carryParts= Math.min(Math.max(1,parseInt((energyCap-workParts*100-moveParts*50)/50)),4);
	if (energyCap < 500) {moveParts=2;carryParts=1;workParts=1;}
    return Array(workParts).fill(WORK).concat(Array(carryParts).fill(CARRY)).concat(Array(moveParts).fill(MOVE));
  },
  upgraderPreset: function(spawn){
    var energyCap = spawn.room.energyCapacityAvailable;
    var workParts = Math.max(1,parseInt(((energyCap-100)/100)));
    if (workParts > 15) workParts = 15;
    var carryParts = parseInt((energyCap-(100*workParts)-50)/50);
    if (carryParts > 3) carryParts = 3;
	//var moveParts = 1;
	var moveParts = parseInt((energyCap-(100*workParts)-50*carryParts)/50);
	if (moveParts > 6) moveParts = 6;
    if (spawn.room.memory.activeCreepRoles.miner == 0) {moveParts=1;carryParts=1;workParts=1;}
    return Array(workParts).fill(WORK).concat(Array(carryParts).fill(CARRY)).concat(Array(moveParts).fill(MOVE));
  },
  defenderPreset: function(spawn){
    var energyCap = spawn.room.energyCapacityAvailable;
    var moveParts = 2;
    var attackParts = 2;
    var toughParts = 0;
	
	if (energyCap >= 1050) {moveParts=5;toughParts=0;attackParts=10;}
	if (energyCap < 950) {moveParts=4;toughParts=0;attackParts=8;}
	if (energyCap < 800) {moveParts=4;toughParts=0;attackParts=7;}
	if (energyCap < 700) {moveParts=3;toughParts=0;attackParts=6;}
	if (energyCap < 500) {moveParts=2;toughParts=0;attackParts=2;}
	
	if (toughParts > 0){
		return Array(toughParts).fill(TOUGH).concat(Array(moveParts).fill(MOVE)).concat(Array(attackParts).fill(ATTACK));
	}
	else {
		return Array(moveParts).fill(MOVE).concat(Array(attackParts).fill(ATTACK));
	}
  },
  
  expand: function(spawn){
    console.log("Check for Expansion")
    var pos = spawn.pos;/*
    if (false && spawn.room.controller.level == 2 && spawn.room.energyCapacityAvailable < 550){
      spawn.room.createConstructionSite(pos.x,pos.y+2,STRUCTURE_EXTENSION);
      spawn.room.createConstructionSite(pos.x+2,pos.y+1,STRUCTURE_EXTENSION);
      spawn.room.createConstructionSite(pos.x-2,pos.y+1,STRUCTURE_EXTENSION);
      spawn.room.createConstructionSite(pos.x+2,pos.y-1,STRUCTURE_EXTENSION);
      spawn.room.createConstructionSite(pos.x-2,pos.y-1,STRUCTURE_EXTENSION);
      
    }*/

    var structures = Game.rooms[spawn.room.name].find(FIND_STRUCTURES,{filter: (structure) => structure.structureType == STRUCTURE_TOWER});
    if (spawn.room.controller.level == 3 && structures[0] == undefined){
      spawn.room.createConstructionSite(pos.x-4,pos.y+4,STRUCTURE_TOWER);
    }
  },
  
  buildSourceRoads: function(spawn){
    var pathArrayArray = {};
    for (var i in spawn.room.memory.sources){
      var source = Game.getObjectById(i); 
      var path = spawn.room.findPath(source.pos,source.room.controller.pos);
      var pathArray = Room.deserializePath(Room.serializePath(path));
      for (var j=0;j<pathArray.length;j++){
        pathArrayArray[i] = source.room.createConstructionSite(pathArray[j].x,pathArray[j].y,STRUCTURE_ROAD);
      }
    }
  },
  
  buildSwampRoads: function(spawn){
    var pathArrayArray = {};
    for (var i in spawn.room.memory.sources){
      var source = Game.getObjectById(i); 
      var path = spawn.room.findPath(source.pos,source.room.controller.pos);
      var pathArray = Room.deserializePath(Room.serializePath(path));
      for (var j=0;j<pathArray.length;j++){
        if (spawn.room.lookForAt(LOOK_TERRAIN,pathArray[j].x,pathArray[j].y) == "swamp")
          pathArrayArray[i] = source.room.createConstructionSite(pathArray[j].x,pathArray[j].y,STRUCTURE_ROAD);
      }
    }
  },

  roomProfiler: function(spawn){
    var room = spawn.room.name;
    if(!Memory.rooms[room].stats){
        Memory.rooms[room].stats={};
    }else{
        if(!Memory.rooms[room].stats.spawns){
            Memory.rooms[room].stats.spawns ={};
        }else{
            if(!Memory.rooms[room].stats.spawns[spawn.name]){
                Memory.rooms[room].stats.spawns[spawn.name] = {};
            }
        }

    }


        if(Game.ticks % 1000 == 0){
            Memory.rooms[room].stats.spawns[spawn.name].utilization=Memory.rooms[room].stats.spawns[spawn.name].ticks_s/1000;
            Memory.rooms[room].stats.spawns[spawn.name].ticks_s=0;
            Memory.rooms[room].stats.spawns[spawn.name].waitingForEnergy=Memory.rooms[room].stats.spawns[spawn.name].ticks_e/1000;
            Memory.rooms[room].stats.spawns[spawn.name].ticks_e=0;
        }else{
            if(spawn.spawning != null){
                Memory.rooms[room].stats.spawns[spawn.name].ticks_s=Memory.rooms[room].stats.spawns[spawn.name].ticks_s+1;
            }else if(spawn.room.energyAvailable < spawn.room.energyCapacityAvailable){
                Memory.rooms[room].stats.spawns[spawn.name].ticks_e=Memory.rooms[room].stats.spawns[spawn.name].ticks_e+1;
            }
        }

  }
  
};