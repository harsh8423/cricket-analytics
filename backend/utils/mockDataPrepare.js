const fs = require('fs');
const path = require('path');

// Import player-wise data
const playerWiseData = require('./playerWiseData.js');

// Function to build mockTreeData dynamically
const buildMockTreeData = (data) => {
  const teams = {};

  // Group players by team and role
  Object.values(data).forEach((player) => {
    const { team_name, role, name, player_id } = player;

    if (!teams[team_name]) {
      teams[team_name] = {};
    }

    if (!teams[team_name][role]) {
      teams[team_name][role] = [];
    }

    teams[team_name][role].push({ label: name, value: player_id });
  });

  // Build tree structure
  const treeData = Object.entries(teams).map(([teamName, roles]) => ({
    label: teamName,
    value: teamName.toLowerCase().replace(/\s+/g, '-'),
    children: Object.entries(roles).map(([role, players]) => ({
      label: role.charAt(0).toUpperCase() + role.slice(1), // Capitalize role
      value: `${teamName.toLowerCase().replace(/\s+/g, '-')}-${role.toLowerCase().replace(/\s+/g, '-')}`,
      children: players
    }))
  }));

  return treeData;
};

// Generate the mockTreeData
const mockTreeData = buildMockTreeData(playerWiseData);

// Save the mockTreeData to a file
const outputPath = path.join(__dirname, 'mockTreeData.js');
const fileContent = `export const mockTreeData = ${JSON.stringify(mockTreeData, null, 2)};`;

fs.writeFileSync(outputPath, fileContent);

console.log(`mockTreeData saved to ${outputPath}`);
