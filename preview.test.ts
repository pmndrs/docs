import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Calculates the SHA256 hash of a directory recursively
 */
function calculateDirHash(dirPath: string): string {
  const hash = createHash('sha256');
  
  function processPath(currentPath: string) {
    const stats = fs.statSync(currentPath);
    
    if (stats.isDirectory()) {
      const items = fs.readdirSync(currentPath).sort();
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        processPath(itemPath);
      }
    } else if (stats.isFile()) {
      // Include the relative path in the hash for uniqueness
      const relativePath = path.relative(dirPath, currentPath);
      hash.update(relativePath);
      
      // Include the file content
      const content = fs.readFileSync(currentPath);
      hash.update(content);
    }
  }
  
  processPath(dirPath);
  return hash.digest('hex');
}

/**
 * Cleans up the output directory
 */
function cleanupOutput(mdxPath: string) {
  const outPath = path.join(mdxPath, 'out');
  if (fs.existsSync(outPath)) {
    fs.rmSync(outPath, { recursive: true, force: true });
  }
}

/**
 * Runs the docker build command from preview.sh
 */
function runDockerBuild(mdxPath: string) {
  const mdxDir = path.basename(mdxPath);
  const dockerImage = process.env.DOCKER_IMAGE || 'ghcr.io/pmndrs/docs';
  const dockerTag = process.env.DOCKER_TAG || 'latest';
  
  // Run the same docker command as preview.sh but just the build part
  const cmd = `docker run --rm --init -t \
    -v "./${mdxDir}":/app/docs \
    -e MDX=${mdxDir} \
    -e NEXT_PUBLIC_LIBNAME=TestLib \
    -e DIST_DIR="${mdxDir}/out" \
    -e OUTPUT=export \
    ${dockerImage}:${dockerTag} pnpm run build`;
  
  console.log('Running docker build command...');
  execSync(cmd, {
    cwd: process.cwd(),
    stdio: 'inherit',
    timeout: 120000, // 2 minutes timeout
  });
}

describe('preview.sh', () => {
  const testMdxPath = path.join(process.cwd(), 'test-mdx');
  
  beforeAll(() => {
    // Ensure test MDX directory exists
    if (!fs.existsSync(testMdxPath)) {
      throw new Error(`Test MDX directory not found: ${testMdxPath}`);
    }
    
    // Clean up any existing output
    cleanupOutput(testMdxPath);
  });
  
  afterAll(() => {
    // Clean up after tests
    cleanupOutput(testMdxPath);
  });
  
  it('should produce identical SHA for the same MDX input', () => {
    // First run
    console.log('\\n=== First build run ===');
    runDockerBuild(testMdxPath);
    
    const outPath1 = path.join(testMdxPath, 'out');
    expect(fs.existsSync(outPath1)).toBe(true);
    
    const hash1 = calculateDirHash(outPath1);
    console.log('First run hash:', hash1);
    
    // Clean up output
    cleanupOutput(testMdxPath);
    
    // Second run
    console.log('\\n=== Second build run ===');
    runDockerBuild(testMdxPath);
    
    const outPath2 = path.join(testMdxPath, 'out');
    expect(fs.existsSync(outPath2)).toBe(true);
    
    const hash2 = calculateDirHash(outPath2);
    console.log('Second run hash:', hash2);
    
    // Verify the hashes are identical
    expect(hash1).toBe(hash2);
  }, 300000); // 5 minutes total timeout for this test
});
