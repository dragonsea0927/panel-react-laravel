import FormBlock from '@/components/FormBlock'
import { SettingsContext } from '@/pages/admin/nodes/settings/Index'
import { ServerContext } from '@/pages/servers/Show'
import { formDataHandler } from '@/util/helpers'
import { Inertia } from '@inertiajs/inertia'
import { useForm } from '@inertiajs/inertia-react'
import { Button, NumberInput, Paper, TextInput } from '@mantine/core'
import { ChangeEvent, FormEvent, useContext, useEffect } from 'react'

const BasicSettings = () => {
  const settingsContext = useContext(SettingsContext)

  const { data, setData, put, processing, errors, reset } = useForm({
    name: settingsContext?.node.name,
    cluster: settingsContext?.node.cluster,
    hostname: settingsContext?.node.hostname,
    username: '',
    password: '',
    port: settingsContext?.node.port,
    auth_type: settingsContext?.node.auth_type,
  })

  const submit = (e: FormEvent<HTMLFormElement>) => {
    put(route('admin.nodes.show.settings.basic-info', settingsContext?.node.id))
  }

  const onHandleChange = (event: ChangeEvent<HTMLInputElement>) =>
    formDataHandler(event, setData)

  return (
    <FormBlock
      title='Basic Settings'
      inputs={
        <div className='flex flex-col space-y-3'>
          <TextInput
            label='Name'
            name='name'
            value={data.name}
            onChange={onHandleChange}
            error={errors.name}
            required
          />

          <div className='grid sm:grid-cols-3 sm:gap-3 space-y-3 sm:space-y-0'>
            <TextInput
              label='Hostname'
              name='hostname'
              value={data.hostname}
              className='block w-full sm:col-span-2'
              onChange={onHandleChange}
              error={errors.hostname}
              required
            />
            <NumberInput
              label='Port'
              name='port'
              value={data.port}
              className='block w-full sm:col-span-1'
              onChange={(e) => setData('port', e as number)}
              error={errors.port}
              required
            />
          </div>
          <TextInput
            label='Node Name (as appears under Nodes in Proxmox)'
            name='cluster'
            value={data.cluster}
            onChange={onHandleChange}
            error={errors.cluster}
            required
          />
          <TextInput
            label='Username'
            name='username'
            placeholder='New username'
            value={data.username}
            onChange={onHandleChange}
            error={errors.username}
          />
          <TextInput
            label='Password'
            name='password'
            type='password'
            placeholder='New password'
            value={data.password}
            onChange={onHandleChange}
            error={errors.password}
          />
        </div>
      }
      defaultAction
      onSubmit={submit}
      processing={processing}
    />
  )
}

export default BasicSettings
