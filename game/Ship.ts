import { GenericShip } from './GenericShip'

export class Ship {
    // Add Ship List. Naming too. 
	public ships: Map<string, GenericShip> = new Map<string, GenericShip>()

    constructor() {}

    addShip(username: string, color: string): GenericShip {

        const ship = new GenericShip()

        if (color === 'green') {

            ship.shipColor = 0x00_ff_00_ff;

            ship.cockpitColor = 0x00_ff_ff_ff;
    
            ship.gunColor = 0xa1_00_00_ff;
    
            ship.trailColor = 0x00_ff_00_ff;
            
        }

        this.ships.set(username, ship)

        return ship

    }

    get players(): i32 {

        return this.ships.size

    }
}