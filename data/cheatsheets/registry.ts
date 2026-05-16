import sql    from './sql.json'
import python from './python.json'
import dax    from './dax.json'
import git    from './git.json'
import vscode from './vscode.json'
import vim    from './vim.json'

// To add a new cheat sheet:
// 1. Drop a JSON file in this directory (same schema as the others)
// 2. Import it above and add one entry to SHEETS below

export const SHEETS = [
  { key: 'sql',    data: sql    },
  { key: 'python', data: python },
  { key: 'dax',    data: dax    },
  { key: 'git',    data: git    },
  { key: 'vscode', data: vscode },
  { key: 'vim',    data: vim    },
] as const

export type SheetKey  = typeof SHEETS[number]['key']
export type SheetData = typeof SHEETS[number]['data']
