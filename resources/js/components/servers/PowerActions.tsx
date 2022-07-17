import updateState, { PowerAction } from '@/api/server/updateState'
import { ServerContext } from '@/pages/servers/Show'
import { Button, Paper } from '@mantine/core'
import { useContext } from 'react'

const PowerActions = () => {
  const serverContext = useContext(ServerContext)
  const serverState = serverContext?.serverState

  const postState = (state: PowerAction) => updateState(state, serverContext?.server.id as number)

  return (
    <div>
      <h3 className='h2-deemphasized'>Power Actions</h3>
      <Paper shadow='xs' className='flex space-x-3 p-card mt-3'>
        <Button onClick={() => postState('start')} variant='default' disabled={!serverState || serverState?.state === 'running'}>Start</Button>
        <Button onClick={() => postState('reboot')} variant='default' disabled={serverState?.state !== 'running'}>Restart</Button>
        <Button onClick={() => postState('kill')} color='red' variant='outline' disabled={!serverState || serverState?.state === 'stopped'}>
          Kill
        </Button>
        <Button onClick={() => postState('shutdown')} color='red' disabled={serverState?.state !== 'running'}>Stop</Button>
      </Paper>
    </div>
  )
}

export default PowerActions
