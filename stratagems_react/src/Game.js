import React, { useState, useEffect, useRef } from 'react';

const Game = () => {
    const gridSize = 10;
    const [grid, setGrid] = useState(Array(gridSize).fill(Array(gridSize).fill({ faction: null, life: 0, dead: false })));
    const factions = ['Red', 'Blue', 'Green', 'Yellow', 'Purple']; // Map - Fire, Water, Wood, Earth, Metal
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [playerCommits, setPlayerCommits] = useState(new Array(factions.length).fill(false));
    const [playerActions, setPlayerActions] = useState(new Array(factions.length).fill([]));
    const [zoomLevel, setZoomLevel] = useState(1);
    const [transformOrigin, setTransformOrigin] = useState('center');
    const gridRef = useRef(null);

    // Element mapping
    const elementMapping = {
        'Red': 'Fire',
        'Blue': 'Water',
        'Green': 'Wood',
        'Yellow': 'Earth',
        'Purple': 'Metal'
    };

    const generatingCycle = {
        'Wood': 'Fire',
        'Fire': 'Earth',
        'Earth': 'Metal',
        'Metal': 'Water',
        'Water': 'Wood'
    };

    const overcomingCycle = {
        'Wood': 'Earth',
        'Earth': 'Water',
        'Water': 'Fire',
        'Fire': 'Metal',
        'Metal': 'Wood'
    };

    const placeLand = (row, col) => {
        const selectedFaction = factions[currentPlayerIndex];
    
        // update the grid to reflect the new placement
        const newGrid = grid.map((r, ri) => 
            ri === row ? r.map((c, ci) => ci === col ? { faction: selectedFaction, life: 3, dead: false } : c) : r
        );
        setGrid(newGrid);
    
        // track the action during the commit phase
        setPlayerActions(actions => {
            const newActions = [...actions];
            newActions[currentPlayerIndex] = [...newActions[currentPlayerIndex], { row, col, faction: selectedFaction }];
            return newActions;
        });
    };
    

    const handleCommit = () => {
        setPlayerCommits(commits => {
            const newCommits = [...commits];
            newCommits[currentPlayerIndex] = true;
            return newCommits;
        });

        const allCommitted = playerCommits.every(commit => commit);
        if (allCommitted) {
            processGrid();
            setPlayerCommits(new Array(factions.length).fill(false));
            setPlayerActions(new Array(factions.length).fill([]));
        }

        setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % factions.length);
    };


const processGrid = () => {

    // detech conflicts and mark them as Evil
    playerActions.forEach((actions, index) => {
        actions.forEach(action => {
            const { row, col } = action;
            playerActions.forEach((otherActions, otherIndex) => {
                if (otherIndex !== index) {
                    otherActions.forEach(otherAction => {
                        if (otherAction.row === row && otherAction.col === col) {
                            // Conflict found, mark as Evil
                            grid[row][col] = { faction: 'Evil', life: 1, dead: false };
                        }
                    });
                }
            });
        });
    });
    
    let newGrid = grid.map(row => row.map(cell => ({ ...cell })));

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            let currentCell = newGrid[row][col];
            if (currentCell.dead || !currentCell.faction || currentCell.faction === 'Evil') continue;

            const currentElement = elementMapping[currentCell.faction];
            const neighbors = [
                { r: row - 1, c: col }, // Up
                { r: row + 1, c: col }, // Down
                { r: row, c: col - 1 }, // Left
                { r: row, c: col + 1 }  // Right
            ];

            neighbors.forEach(n => {
                if (n.r >= 0 && n.r < gridSize && n.c >= 0 && n.c < gridSize) {
                    let neighborCell = newGrid[n.r][n.c];
                    if (neighborCell.faction && neighborCell.faction !== 'Evil') {
                        const neighborElement = elementMapping[neighborCell.faction];

                        // Check for Generating Cycle
                        if (currentElement in generatingCycle && generatingCycle[currentElement] === neighborElement) {
                            currentCell.life -= 1;
                            neighborCell.life += 1;
                        }

                        // Check for Overcoming Cycle
                        if (currentElement in overcomingCycle && overcomingCycle[currentElement] === neighborElement) {
                            currentCell.life += 1;
                            neighborCell.life -= 1;
                        }

                        // TODO: maybe i shouldn't make this rule
                        // // // Base Rule for same faction
                        // if (neighborCell.faction === currentCell.faction) {
                        //     currentCell.life += 1;
                        // }
                    }
                }
            });

            // Ensure life doesn't go below 0 and mark dead if life is 0 & remove color
            currentCell.life = Math.max(currentCell.life, 0);
            if (currentCell.life === 0) {
                currentCell.dead = true;
                currentCell.faction = null; // Remove color
            }
        }
    }

    setGrid(newGrid);
};

    
    

    useEffect(() => {
    }, [grid, playerCommits, playerActions]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h1>Stratagems Game</h1>
            <h2>Player's Turn: {factions[currentPlayerIndex]}</h2>
            <div style={{ marginBottom: '20px' }}>
                {factions.map((faction, index) => (
                    <button key={faction} disabled={currentPlayerIndex !== index} style={{ marginRight: '10px' }}>
                        {faction}
                    </button>
                ))}
            </div>
            <div 
                ref={gridRef}
                style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    transform: `scale(${zoomLevel})`, 
                    transformOrigin: transformOrigin,
                    border: '1px solid black',
                }}
            >
                {grid.map((row, rowIndex) => (
                    <div key={rowIndex} style={{ display: 'flex' }}>
                        {row.map((cell, colIndex) => (
                            <div key={colIndex} style={{ width: '50px', height: '50px', backgroundColor: cell.faction === 'Evil' ? 'lightgrey' : cell.faction || 'white', border: '1px solid grey' }}
                                onClick={() => placeLand(rowIndex, colIndex)}>
                                {cell.life}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div style={{ marginTop: '20px' }}>
                <button onClick={handleCommit} style={{ marginRight: '10px' }}>Commit</button>
            </div>
        </div>
    );
};

export default Game;
