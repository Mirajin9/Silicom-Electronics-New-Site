// Builds the GitHub Pages copy (scripts/build-pages.mjs) and stages it on the gh-pages branch,
// which GitHub Pages publishes. gh-pages holds only the built site; its checkout is a worktree
// in ../.gh-pages (ignored by git), created the first time. Review, then commit and push it:
//   git -C ../.gh-pages commit -m "Publish the new site"
//   git -C ../.gh-pages push origin gh-pages
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const proto = path.resolve(import.meta.dirname, '..');
const repo = path.resolve(proto, '..');
const out = path.join(proto, 'dist-pages');
const tree = path.join(repo, '.gh-pages');
const git = (args, cwd = repo) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
const has = (ref) => { try { git(['rev-parse', '--verify', '--quiet', ref]); return true; } catch { return false; } };

execFileSync(process.execPath, [path.join(import.meta.dirname, 'build-pages.mjs')], { cwd: proto, stdio: 'inherit' });

if (!fs.existsSync(path.join(tree, '.git'))) {
  try { git(['fetch', 'origin', 'gh-pages']); } catch { /* not published yet */ }
  if (has('gh-pages')) git(['worktree', 'add', tree, 'gh-pages']);
  else if (has('origin/gh-pages')) git(['worktree', 'add', '-b', 'gh-pages', tree, 'origin/gh-pages']);
  else {
    git(['worktree', 'add', '--detach', tree]);
    git(['checkout', '--orphan', 'gh-pages'], tree);
    git(['rm', '-rf', '--quiet', '.'], tree);
  }
}

for (const f of fs.readdirSync(tree)) if (f !== '.git') fs.rmSync(path.join(tree, f), { recursive: true, force: true });
fs.cpSync(out, tree, { recursive: true });
git(['add', '--all'], tree);
const changes = git(['status', '--short'], tree).split('\n').filter(Boolean).length;
console.log(changes
  ? `Staged ${changes} changed files on gh-pages (${path.relative(process.cwd(), tree)}). Commit and push them to publish.`
  : 'gh-pages already matches this build.');
