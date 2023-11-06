import useFlash from '@/util/useFlash'
import usePagination from '@/util/usePagination'
import { FormikProvider, useFormik } from 'formik'
import * as yup from 'yup'

import createAddress from '@/api/admin/nodes/addresses/createAddress'
import updateAddress from '@/api/admin/nodes/addresses/updateAddress'
import useAddressesSWR from '@/api/admin/nodes/addresses/useAddressesSWR'
import useNodeSWR from '@/api/admin/nodes/useNodeSWR'
import { Address } from '@/api/server/getServer'

import FlashMessageRender from '@/components/elements/FlashMessageRenderer'
import Modal from '@/components/elements/Modal'
import RadioGroupFormik from '@/components/elements/formik/RadioGroupFormik'
import TextInputFormik from '@/components/elements/formik/TextInputFormik'
import Radio from '@/components/elements/inputs/Radio'

import ServersSelectFormik from '@/components/admin/nodes/addresses/ServersSelectFormik'


interface Props {
    open: boolean
    onClose: () => void
    address?: Address
}

const EditAddressModal = ({ open, onClose, address }: Props) => {
    const { clearFlashes, clearAndAddHttpError } = useFlash()
    const { data: node } = useNodeSWR()
    const [page] = usePagination()
    const { mutate } = useAddressesSWR(node.id, { page, include: ['server'] })

    const form = useFormik({
        enableReinitialize: true,
        initialValues: {
            serverId: address?.server?.id.toString() ?? '',
            address: address?.address ?? '',
            cidr: address?.cidr ?? '',
            gateway: address?.gateway ?? '',
            macAddress: address?.macAddress ?? '',
            type: address?.type ?? 'ipv4',
        },
        validationSchema: yup.object({
            address: yup.string().required('Specify an address'),
            cidr: yup.number().required('Specify a CIDR'),
            gateway: yup.string().required('Specify a gateway'),
            macAddress: yup.string().optional(),
            type: yup.string().required('Specify a type'),
        }),
        onSubmit: async ({ cidr, serverId, ...values }, { setSubmitting }) => {
            clearFlashes('admin:node:addresses.edit')
            setSubmitting(true)
            try {
                if (address) {
                    const updatedAddress = await updateAddress(
                        node.id,
                        address.id,
                        {
                            ...values,
                            serverId: parseInt(serverId as string),
                            cidr: parseInt(cidr as string),
                        }
                    )

                    mutate(data => {
                        if (!data) return data

                        return {
                            ...data,
                            items: data.items.map(item => {
                                if (item.id === updatedAddress.id) {
                                    return updatedAddress
                                }

                                return item
                            }),
                        }
                    }, false)
                } else {
                    const address = await createAddress(node.id, {
                        ...values,
                        serverId: parseInt(serverId as string),
                        cidr: parseInt(cidr as string),
                    })

                    mutate(data => {
                        if (!data) return data

                        return {
                            ...data,
                            items: [address, ...data.items],
                        }
                    }, false)
                }

                handleClose()
            } catch (error) {
                clearAndAddHttpError({
                    key: 'admin:node:addresses.edit',
                    error,
                })
            }

            setSubmitting(false)
        },
    })

    const handleClose = () => {
        form.resetForm()
        onClose()
    }

    return (
        <Modal open={open} onClose={handleClose}>
            <Modal.Header>
                <Modal.Title>{address ? 'Edit' : 'New'} Address</Modal.Title>
            </Modal.Header>

            <FormikProvider value={form}>
                <form onSubmit={form.handleSubmit}>
                    <Modal.Body>
                        <FlashMessageRender
                            className='mb-5'
                            byKey={'admin:node:addresses.edit'}
                        />
                        <TextInputFormik
                            name='address'
                            label='Address'
                            placeholder='127.0.0.1'
                        />
                        <RadioGroupFormik
                            name='type'
                            orientation='vertical'
                            spacing={6}
                        >
                            <Radio value='ipv4' label='IPv4' />
                            <Radio value='ipv6' label='IPv6' />
                        </RadioGroupFormik>
                        <TextInputFormik
                            name='cidr'
                            label='Cidr/Subnet mask'
                            placeholder='24'
                        />
                        <TextInputFormik name='gateway' label='Gateway' />
                        <TextInputFormik
                            name='macAddress'
                            label='Mac Address (optional)'
                        />
                        <ServersSelectFormik />
                    </Modal.Body>
                    <Modal.Actions>
                        <Modal.Action type='button' onClick={handleClose}>
                            Cancel
                        </Modal.Action>
                        <Modal.Action type='submit' loading={form.isSubmitting}>
                            {address ? 'Update' : 'Create'}
                        </Modal.Action>
                    </Modal.Actions>
                </form>
            </FormikProvider>
        </Modal>
    )
}

export default EditAddressModal