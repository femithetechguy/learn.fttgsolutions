import { redirect } from 'next/navigation'
import { SHEETS } from '../../../data/cheatsheets/registry'

export default function CheatsheetsIndex() {
  redirect(`/cheatsheets/${SHEETS[0].key}`)
}
