var scoutingOperation = require('class.operation.scouting');
var attackOperation = require('class.operation.attack');
var tankOperation = require('class.operation.tank');
var thiefOperation = require('class.operation.steal');
var reserveOperation = require('class.operation.reserve');
var remote_miningOperation = require('class.operation.remote_mining');
module.exports = {

    // HANDLE ALL OPERATIONS
    run: function() {
        //Travel to Location

        for(var id in Memory.operations){
            switch (Memory.operations[id].type) {
                case 'scouting':
                    //console.log('Case: Scouting');
                    scoutingOperation.run(id);
                    break;
                case 'attack':

                    attackOperation.run(id);
                    break;
                case 'tank':
                    console.log('Case: Tanking');
                    tankOperation.run(id);
                    break;
                case 'steal':
                    //console.log('Case: Steal');
                    thiefOperation.run(id);
                    break;
                case 'reserve':
                    reserveOperation.run(id);
                    break;
                case 'remote_mining':
                    remote_miningOperation.run(id);
                    break;

            }





        }

    }




};
