import { Counter } from './components/Counter'
import { FoundationTable } from './components/FoundationTable'
import foundations from './foundations.json'

export default {
  components: { Counter, FoundationTable },
  scope: { foundations },
}
