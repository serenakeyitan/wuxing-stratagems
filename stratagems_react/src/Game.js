import React, { useState, useEffect, useRef } from 'react';

const Game = () => {
    const gridSize = 10;
    const [grid, setGrid] = useState(Array(gridSize).fill(Array(gridSize).fill({ faction: null, life: 0, dead: false })));
    const factions = ['Red', 'Blue', 'Green', 'Yellow', 'Purple']; // Evil is not a player-controlled faction
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [playerCommits, setPlayerCommits] = useState(new Array(factions.length).fill(false));
    const [playerActions, setPlayerActions] = useState(new Array(factions.length).fill([])); // Track actions by each player
    const [zoomLevel, setZoomLevel] = useState(1);
    const [transformOrigin, setTransformOrigin] = useState('center');
    const gridRef = useRef(null);

    const placeLand = (row, col) => {
        const selectedFaction = factions[currentPlayerIndex];
        const newGrid = grid.map((r, ri) => 
            ri === row ? r.map((c, ci) => ci === col ? { faction: selectedFaction, life: 1, dead: false } : c) : r
        );
        setGrid(newGrid);

        // Track the action
        setPlayerActions(actions => {
            const newActions = [...actions];
            newActions[currentPlayerIndex] = [...newActions[currentPlayerIndex], { row, col }];
            return newActions;
        });
    };

    const handleCommit = () => {
        setPlayerCommits(commits => {
            const newCommits = [...commits];
            newCommits[currentPlayerIndex] = true;
            return newCommits;
        });

        // Check if all players have committed
        const allCommitted = playerCommits.every(commit => commit);
        if (allCommitted) {
            processGrid(); 
            setPlayerCommits(new Array(factions.length).fill(false)); // Reset commit status for all players
            setPlayerActions(new Array(factions.length).fill([])); // Reset actions
        }

        setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % factions.length); // Switch to the next player
    };

    const processGrid = () => {
        // Find conflicts and mark them as 'Evil'
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

        // updating life values
        let newGrid = grid.map(row => row.map(cell => ({ ...cell })));

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                let currentCell = grid[row][col];
                if (currentCell.dead || !currentCell.faction) continue;

                let sameFactionCount = 0, differentFactionCount = 0;
                const neighbors = [
                    { r: row - 1, c: col }, // Up
                    { r: row + 1, c: col }, // Down
                    { r: row, c: col - 1 }, // Left
                    { r: row, c: col + 1 }, // Right
                ];

                neighbors.forEach(n => {
                    if (n.r >= 0 && n.r < gridSize && n.c >= 0 && n.c < gridSize) {
                        let neighborCell = grid[n.r][n.c];
                        if (neighborCell.faction) {
                            if (neighborCell.faction === currentCell.faction) {
                                sameFactionCount++;
                            } else {
                                differentFactionCount++;
                            }
                        }
                    }
                });

                let lifeChange = sameFactionCount - differentFactionCount;
                if (sameFactionCount === differentFactionCount) lifeChange = -1;

                let newLife = Math.max(currentCell.life + lifeChange, 0);
                newGrid[row][col].life = newLife;
                if (newLife <= 0) newGrid[row][col].dead = true; // Land becomes dead
                if (newLife >= 7) {
                    // TODO: Logic for when land reaches ultimate state
                }
            }
        }

        // TODO: Conflict resolution logic

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
