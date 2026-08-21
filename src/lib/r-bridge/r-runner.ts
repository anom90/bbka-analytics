import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);

export async function runRScript(scriptContent: string): Promise<any> {
  const tempDir = os.tmpdir();
  const scriptPath = path.join(tempDir, `r_script_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.R`);
  
  await fs.promises.writeFile(scriptPath, scriptContent, 'utf-8');

  try {
    const { stdout, stderr } = await execFileAsync('Rscript', [scriptPath], {
      maxBuffer: 20 * 1024 * 1024 // 20MB
    });

    // Clean up script
    await fs.promises.unlink(scriptPath).catch(() => {});

    // Find JSON output in stdout
    const trimmed = stdout.trim();
    // Look for JSON payload between markers or from first { / [ to last } / ]
    const startIdx = trimmed.indexOf('<<<JSON_START>>>');
    const endIdx = trimmed.indexOf('<<<JSON_END>>>');

    let jsonString = '';
    if (startIdx !== -1 && endIdx !== -1) {
      jsonString = trimmed.substring(startIdx + '<<<JSON_START>>>'.length, endIdx).trim();
    } else {
      const firstCurly = trimmed.indexOf('{');
      const lastCurly = trimmed.lastIndexOf('}');
      if (firstCurly !== -1 && lastCurly !== -1) {
        jsonString = trimmed.substring(firstCurly, lastCurly + 1);
      } else {
        throw new Error(`Output R tidak valid: ${trimmed || stderr}`);
      }
    }

    return JSON.parse(jsonString);
  } catch (error: any) {
    await fs.promises.unlink(scriptPath).catch(() => {});
    throw error;
  }
}
