import FlashMessageRender from '@/components/elements/FlashMessageRenderer'
import Modal from '@/components/elements/Modal'
import { FormikProvider, useFormik } from 'formik'
import * as yup from 'yup'
import { useFlashKey } from '@/util/useFlash'
import TextInputFormik from '@/components/elements/forms/TextInputFormik'
import { Text } from '@mantine/core'
import CheckboxFormik from '@/components/elements/forms/CheckboxFormik'
import NodesSelectFormik from '@/components/admin/servers/NodesSelectFormik'
import AddressesMultiSelectFormik from '@/components/admin/servers/AddressesMultiSelectFormik'
import UsersSelectFormik from '@/components/admin/servers/UsersSelectFormik'
import TemplatesSelectFormik from '@/components/admin/servers/TemplatesSelectFormik'
import createServer from '@/api/admin/servers/createServer'
import useServersSWR from '@/api/admin/servers/useServersSWR'
import usePagination from '@/util/usePagination'

interface Props {
    nodeId?: number
    userId?: number
    open: boolean
    onClose: () => void
}

const CreateServerModal = ({ nodeId, userId, open, onClose }: Props) => {
    const [page] = usePagination()
    const { mutate } = useServersSWR({ nodeId, userId, page, includes: ['node', 'user'] })
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('admin:servers.create')

    const form = useFormik({
        initialValues: {
            name: '',
            nodeId: nodeId?.toString() ?? '',
            userId: userId?.toString() ?? '',
            vmid: '',
            hostname: '',
            addressIds: [],
            cpu: '',
            memory: '',
            disk: '',
            snapshotsLimit: '0',
            backupsLimit: '',
            bandwidthLimit: '',
            shouldCreateServer: true,
            startAfterCompletion: false,
            templateUuid: '',
        },
        validationSchema: yup.object({
            name: yup.string().max(40, 'Do not exceed 40 characters').required('A name is required.'),
            nodeId: yup.number().required('A node is required.'),
            vmid: yup.number().min(100).max(999999999),
            hostname: yup.string().max(191, 'Do not exceed 191 characters'),
            addressIds: yup.array().of(yup.number()),
            cpu: yup.number().min(1, "Can't have zero cpus lol").required('A CPU value is required.'),
            memory: yup.number().min(16, 'Please specify at least 16 MiB').required('A memory value is required.'),
            disk: yup.number().min(1, "Can't have no disk lol").required('A disk value is required.'),
            snapshotsLimit: yup.number().min(0),
            backupsLimit: yup.number().min(0),
            bandwidthLimit: yup.number().min(0),
            shouldCreateServer: yup.boolean(),
            templateUuid: yup.string().when('createServer', {
                is: true,
                then: yup.string().required('Specify a template'),
            }),
        }),
        onSubmit: async (
            {
                userId,
                nodeId,
                vmid,
                cpu,
                memory,
                disk,
                snapshotsLimit,
                backupsLimit,
                bandwidthLimit,
                addressIds,
                ...values
            },
            { setSubmitting }
        ) => {
            clearFlashes()
            try {
                const server = await createServer({
                    ...values,
                    vmid: vmid !== '' ? parseInt(vmid) : null,
                    nodeId: parseInt(nodeId),
                    userId: parseInt(userId),
                    limits: {
                        cpu: parseInt(cpu),
                        memory: parseInt(memory) * 1048576,
                        disk: parseInt(disk) * 1048576,
                        snapshots: snapshotsLimit !== '' ? parseInt(snapshotsLimit) : null,
                        backups: backupsLimit !== '' ? parseInt(backupsLimit) : null,
                        bandwidth: bandwidthLimit !== '' ? parseInt(bandwidthLimit) : null,
                        addressIds,
                    },
                })

                mutate(data => {
                    if (!data) return data

                    return {
                        ...data,
                        items: [server, ...data.items],
                    }
                }, false)

                handleClose()
            } catch (e) {
                clearAndAddHttpError(e as Error)
            }

            setSubmitting(false)
        },
    })

    const handleClose = () => {
        clearFlashes()
        form.resetForm()
        onClose()
    }

    return (
        <Modal open={open} onClose={handleClose}>
            <Modal.Header>
                <Modal.Title>Create a Server</Modal.Title>
            </Modal.Header>

            <FormikProvider value={form}>
                <form onSubmit={form.handleSubmit}>
                    <Modal.Body>
                        <FlashMessageRender className='mb-5' byKey={'admin:servers.create'} />
                        <TextInputFormik name={'name'} label={'Display Name'} />
                        {nodeId ? null : <NodesSelectFormik />}
                        {userId ? null : <UsersSelectFormik />}
                        <TextInputFormik name={'vmid'} label={'VMID'} placeholder={'Leave blank to generate'} />
                        <TextInputFormik name={'hostname'} label={'Hostname'} />
                        <AddressesMultiSelectFormik disabled={form.values.nodeId === ''} />
                        <div className={'grid grid-cols-2 gap-3'}>
                            <TextInputFormik name={'cpu'} label={'CPUs'} />
                            <TextInputFormik name={'memory'} label={'Memory (MiB)'} />
                        </div>
                        <TextInputFormik name={'disk'} label={'Disk (MiB)'} />
                        <div className={'grid grid-cols-2 gap-3'}>
                            <TextInputFormik
                                name={'backupsLimit'}
                                label={'Backups Limit'}
                                placeholder={'Leave blank for no limit'}
                            />
                            <TextInputFormik
                                name={'bandwidthLimit'}
                                label={'Bandwidth Limit'}
                                placeholder={'Leave blank for no limit'}
                            />
                        </div>
                        <CheckboxFormik name={'shouldCreateServer'} label={'Create Server'} className={'mt-3'} />
                        <TemplatesSelectFormik
                            disabled={!form.values.shouldCreateServer || form.values.nodeId === ''}
                        />
                        <CheckboxFormik
                            name={'startAfterCompletion'}
                            label={'Start Server After Completion'}
                            className={'mt-3 relative'}
                        />
                    </Modal.Body>
                    <Modal.Actions>
                        <Modal.Action type='button' onClick={handleClose}>
                            Cancel
                        </Modal.Action>
                        <Modal.Action type='submit' loading={form.isSubmitting}>
                            Create
                        </Modal.Action>
                    </Modal.Actions>
                </form>
            </FormikProvider>
        </Modal>
    )
}

export default CreateServerModal
