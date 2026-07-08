const { execSync } = require('child_process');

try {
  const output = execSync('wmic process where "name=\'node.exe\'" get ProcessId, CommandLine').toString();
  const lines = output.split('\n');
  lines.forEach(line => {
    if (line.includes('localtunnel') || line.includes('lt.js')) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && !isNaN(pid)) {
        console.log(`Killing localtunnel process: PID ${pid}`);
        try {
          process.kill(pid, 'SIGKILL');
        } catch (e) {
          console.error(`Failed to kill PID ${pid}:`, e.message);
        }
      }
    }
  });
} catch (err) {
  console.error('Error listing/killing processes:', err.message);
}
