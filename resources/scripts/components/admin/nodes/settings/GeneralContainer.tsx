import LocationsSelectFormik from '@/components/admin/nodes/LocationsSelectFormik'
import Button from '@/components/elements/Button'
import FlashMessageRender from '@/components/elements/FlashMessageRenderer'
import FormCard from '@/components/elements/FormCard'
import TextInputFormik from '@/components/elements/forms/TextInputFormik'
import FormSection from '@/components/elements/FormSection'
import { NodeContext } from '@/state/admin/node'
import { FormikProvider, useFormik } from 'formik'
import * as yup from 'yup'

const GeneralContainer = () => {
    const node = NodeContext.useStoreState(state => state.node.data!)

    const form = useFormik({
        initialValues: {
            name: node.name,
            locationId: node.locationId.toString(),
            cluster: node.cluster,
            tokenId: undefined as string | undefined,
            secret: undefined as string | undefined,
            fqdn: node.fqdn,
            port: node.port,
            memory: node.memory,
            memoryOverallocate: node.memoryOverallocate,
            disk: node.disk,
            diskOverallocate: node.diskOverallocate,
            vmStorage: node.vmStorage,
            backupStorage: node.backupStorage,
            isoStorage: node.isoStorage,
            network: node.network,
        },
        validationSchema: yup.object({
            name: yup.string().required('Specify a name').max(191, 'Please limit up to 191 characters'),
            locationId: yup.number().required('Specify a location'),
            cluster: yup.string().required('Specify a cluster').max(191, 'Please limit up to 191 characters'),
            tokenId: yup.string().max(191, 'Please limit up to 191 characters').optional(),
            secret: yup.string().max(191, 'Please limit up to 191 characters').optional(),
            fqdn: yup
                .string()
                .matches(
                    /((https?):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/,
                    'Enter a valid FQDN'
                )
                .required('Specify a FQDN')
                .max(191, 'Please limit up to 191 characters'),
            port: yup
                .number()
                .integer()
                .required('Specify a port')
                .min(1, 'Please specify a valid port')
                .max(65535, 'Please specify a valid port'),
            memory: yup.number().integer().required('Specify a memory').min(0, 'Please specify a valid memory'),
            memoryOverallocate: yup
                .number()
                .integer()
                .required('Specify a memory overallocate')
                .min(0, 'Please specify a valid memory overallocate'),
            disk: yup.number().integer().required('Specify a disk').min(0, 'Please specify a valid disk'),
            diskOverallocate: yup
                .number()
                .integer()
                .required('Specify a disk overallocate')
                .min(0, 'Please specify a valid disk overallocate'),
            vmStorage: yup.string().required('Specify a VM storage').max(191, 'Please limit up to 191 characters'),
            backupStorage: yup
                .string()
                .required('Specify a backup storage')
                .max(191, 'Please limit up to 191 characters'),
            isoStorage: yup.string().required('Specify a ISO storage').max(191, 'Please limit up to 191 characters'),
            network: yup.string().required('Specify a network').max(191, 'Please limit up to 191 characters'),
        }),
        onSubmit: () => {},
    })
    return (
        <FormSection title='General Settings'>
            <FormCard className='w-full'>
                <FormikProvider value={form}>
                    <form onSubmit={form.handleSubmit}>
                        <FormCard.Body>
                            <FormCard.Title>Node Information</FormCard.Title>
                            <div className='space-y-3 mt-3'>
                                <FlashMessageRender byKey='admin:node:settings:general' />
                                <TextInputFormik name='name' label='Display Name' />

                                <LocationsSelectFormik />
                                <TextInputFormik name='fqdn' label='FQDN' />
                            </div>
                        </FormCard.Body>
                        <FormCard.Footer>
                            <Button
                                loading={form.isSubmitting}
                                type='submit'
                                variant='filled'
                                color='success'
                                size='sm'
                            >
                                Save
                            </Button>
                        </FormCard.Footer>
                    </form>
                </FormikProvider>
            </FormCard>
        </FormSection>
    )
}

export default GeneralContainer
