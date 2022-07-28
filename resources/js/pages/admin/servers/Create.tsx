import { DefaultProps, User } from '@/api/types/default'
import { Server } from '@/api/server/types'
import Authenticated from '@/components/layouts/Authenticated'
import Main from '@/components/Main'
import { Head, Link, useForm } from '@inertiajs/inertia-react'
import { ArrowLeftIcon, ChevronLeftIcon } from '@heroicons/react/solid'
import {
  Button,
  Code,
  NumberInput,
  Overlay,
  Paper,
  TextInput,
  ActionIcon,
  Tooltip,
  SegmentedControl,
  Select,
} from '@mantine/core'
import { ChangeEvent, FormEvent, useCallback, useState } from 'react'
import { formDataHandler } from '@/util/helpers'
import { CheckCircleIcon } from '@heroicons/react/outline'
import { Inertia } from '@inertiajs/inertia'
import { debounce } from 'lodash'
import getSearchNodes from '@/api/admin/nodes/searchNodes'
import SelectItem from '@/components/SelectItem'
import getSearchUsers from '@/api/admin/users/searchUsers'

interface Props extends DefaultProps {}

interface FormData {
  name: string
  node_id?: number
  user_id?: number
  vmid?: number
  template_id?: number
}

const Create = ({ auth }: Props) => {
  const { data, setData, post, processing, errors, reset } = useForm<FormData>({
    name: '',
    node_id: undefined,
    user_id: undefined,
    vmid: undefined,
    template_id: undefined,
  })

  const [deploymentType, setDeploymentType] = useState('new')

  const onHandleChange = (event: ChangeEvent<HTMLInputElement>) =>
    formDataHandler(event, setData)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    post(route('admin.nodes.store'))
  }

  const [nodes, setNodes] = useState<
    {
      label: string
      value: string
      description: string
    }[]
  >([])

  const searchNodes = useCallback(
    debounce(async (query: string) => {
      const { data } = await getSearchNodes(query)
      setNodes(
        data.map((node) => {
          return {
            label: node.name,
            value: node.id.toString(),
            description: node.hostname,
          }
        })
      )
    }, 500),
    []
  )

  const [users, setUsers] = useState<
    {
      label: string
      value: string
      description: string
    }[]
  >([])

  const searchUsers = useCallback(
    debounce(async (query: string) => {
      const { data } = await getSearchUsers(query)
      setUsers(
        data.map((user) => {
          return {
            label: user.name,
            value: user.id.toString(),
            description: user.email,
          }
        })
      )
    }, 500),
    []
  )

  return (
    <Authenticated auth={auth} header={<h1 className='h1'>New Server</h1>}>
      <Head title={`Import Node`} />

      <Main>
        <Link
          className='flex items-center space-x-2 p-desc'
          href={route('admin.servers.index')}
        >
          <ArrowLeftIcon className='w-3 h-3' /> <span>Back</span>
        </Link>
        <h3 className='h3-emphasized'>Create a server.</h3>
        <p className='p-desc'>
          Please follow the steps to configure your server and create it.
        </p>
        <div className='flex flex-col !mt-9 space-y-3'>
          <Paper shadow='xs' className='p-card w-full space-y-3'>
            <h3 className='h3 '>Configure Server</h3>
            <SegmentedControl
              value={deploymentType}
              onChange={setDeploymentType}
              data={[
                { label: 'New', value: 'new' },

                { label: 'Existing', value: 'existing' },
              ]}
            />
            <form className='space-y-3' onSubmit={submit}>
              <TextInput
                label='Display Name'
                name='name'
                value={data.name}
                className='mt-1 block w-full'
                onChange={onHandleChange}
                error={errors.name}
                required
              />

              <Select
                label='Node'
                placeholder='Search'
                searchable
                itemComponent={SelectItem}
                clearable
                nothingFound='No options'
                value={data.node_id?.toString()}
                onSearchChange={searchNodes}
                onChange={(e) => setData('node_id', parseInt(e as string))}
                data={nodes}
                error={errors.node_id}
                required
              />

              <Select
                label='User'
                placeholder='Search'
                searchable
                itemComponent={SelectItem}
                clearable
                nothingFound='No options'
                value={data.user_id?.toString()}
                onSearchChange={searchUsers}
                onChange={(e) => setData('user_id', parseInt(e as string))}
                data={users}
                error={errors.user_id}
                required
              />

              <TextInput
                label='VMID'
                name='vmid'
                placeholder={
                  deploymentType === 'new'
                    ? 'Leave blank to auto-generate'
                    : 'Enter VMID'
                }
                value={data.vmid}
                className='mt-1 block w-full'
                onChange={onHandleChange}
                error={errors.vmid}
                required={deploymentType === 'existing'}
              />

              <Button
                className='!mt-9'
                type='submit'
                loading={processing}
                fullWidth
              >
                Deploy
              </Button>
            </form>
          </Paper>

          {/* <Paper shadow='xs' className='p-card w-full space-y-3'>
            <h3 className='h3'>Add Server Templates</h3>

            <p className='p-desc'>
              Server templates are unavailable at the moment.
            </p>
          </Paper> */}
        </div>
      </Main>
    </Authenticated>
  )
}

export default Create
