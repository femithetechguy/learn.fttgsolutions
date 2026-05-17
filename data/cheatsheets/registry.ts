import sql    from './sql.json'
import python from './python.json'
import dax    from './dax.json'
import mCode  from './m-code.json'
import git    from './git.json'
import vscode from './vscode.json'
import vim      from './vim.json'
import homebrew from './homebrew.json'
import html       from './html.json'
import css3       from './css3.json'
import json       from './json.json'
import java       from './java.json'
import javascript from './javascript.json'
import aiPrompts  from './ai-prompts.json'
import markdown   from './markdown.json'

// To add a new cheat sheet:
// 1. Drop a JSON file in this directory (same schema as the others)
// 2. Import it above and add one entry to SHEETS below

export const SHEETS = [
  { key: 'sql',    data: sql    },
  { key: 'python', data: python },
  { key: 'dax',    data: dax    },
  { key: 'm-code', data: mCode  },
  { key: 'git',    data: git    },
  { key: 'vscode', data: vscode },
  { key: 'vim',      data: vim      },
  { key: 'homebrew', data: homebrew },
  { key: 'html',       data: html       },
  { key: 'css3',       data: css3       },
  { key: 'json',       data: json       },
  { key: 'java',       data: java       },
  { key: 'javascript', data: javascript },
  { key: 'ai-prompts', data: aiPrompts  },
  { key: 'markdown',   data: markdown   },
] as const

export type SheetKey  = typeof SHEETS[number]['key']
export type SheetData = typeof SHEETS[number]['data']
