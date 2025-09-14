#!/usr/bin/env node
/**
 * Script para automatizar la actualización del backlog con PRs de GitHub
 * Uso: node scripts/update-backlog-prs.js
 * 
 * Requiere variable de entorno GITHUB_TOKEN para autenticación
 */

import { Octokit } from '@octokit/rest';
import fs from 'fs/promises';
import path from 'path';

const OWNER = 'Mariano3860';
const REPO = 'EntreLibros';

async function fetchAllMergedPRs() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  console.log('Fetching merged PRs from GitHub...');
  
  const prs = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await octokit.rest.pulls.list({
      owner: OWNER,
      repo: REPO,
      state: 'closed',
      sort: 'updated',
      direction: 'desc',
      per_page: 100,
      page
    });

    const mergedPrs = response.data.filter(pr => pr.merged_at);
    prs.push(...mergedPrs);

    hasMore = response.data.length === 100;
    page++;
  }

  return prs.sort((a, b) => new Date(b.merged_at) - new Date(a.merged_at));
}

function inferPRType(title) {
  const lowerTitle = title.toLowerCase();
  
  if (lowerTitle.startsWith('feat')) return 'feat';
  if (lowerTitle.startsWith('fix')) return 'fix';
  if (lowerTitle.startsWith('docs')) return 'docs';
  if (lowerTitle.startsWith('chore')) return 'chore';
  if (lowerTitle.startsWith('ci')) return 'ci';
  if (lowerTitle.startsWith('refactor')) return 'refactor';
  if (lowerTitle.startsWith('test')) return 'test';
  if (lowerTitle.startsWith('style')) return 'style';
  if (lowerTitle.includes('bump') || lowerTitle.includes('update')) return 'chore';
  
  return 'feat'; // default
}

function formatPRsTable(prs) {
  const header = `| # | Título | Autor | Fecha de merge | Tipo | Link |
|---|--------|-------|----------------|------|------|`;

  const rows = prs.map(pr => {
    const mergedAt = new Date(pr.merged_at).toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const type = inferPRType(pr.title);
    const author = pr.user.login;
    
    return `| ${pr.number} | ${pr.title} | ${author} | ${mergedAt} | ${type} | [#${pr.number}](${pr.html_url}) |`;
  });

  return [header, ...rows].join('\n');
}

async function updateBacklogWithPRs() {
  try {
    const prs = await fetchAllMergedPRs();
    console.log(`Found ${prs.length} merged PRs`);

    const backlogPath = path.join(process.cwd(), 'docs', 'backlog.md');
    const backlogContent = await fs.readFile(backlogPath, 'utf-8');

    // Find the PRs section and replace it
    const prTableMarkdown = formatPRsTable(prs);
    
    const startMarker = '## PRs mergeadas';
    const endMarker = '## Hecho';
    
    const startIndex = backlogContent.indexOf(startMarker);
    const endIndex = backlogContent.indexOf(endMarker);
    
    if (startIndex === -1 || endIndex === -1) {
      console.error('No se encontraron las secciones de PRs en el backlog');
      return;
    }

    const beforePRs = backlogContent.substring(0, startIndex + startMarker.length);
    const afterPRs = backlogContent.substring(endIndex);
    
    const updatedContent = `${beforePRs}

${prTableMarkdown}

${afterPRs}`;

    await fs.writeFile(backlogPath, updatedContent, 'utf-8');
    console.log('✅ Backlog actualizado con PRs de GitHub');
    
  } catch (error) {
    console.error('Error actualizando backlog:', error.message);
    process.exit(1);
  }
}

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  updateBacklogWithPRs();
}

export { fetchAllMergedPRs, formatPRsTable, updateBacklogWithPRs };