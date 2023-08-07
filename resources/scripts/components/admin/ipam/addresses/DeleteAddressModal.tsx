import { AddressPool, AddressPoolResponse } from '@/api/admin/addressPools/getAddressPools'
import { KeyedMutator } from 'swr'
import { useTranslation } from 'react-i18next'
import { useFlashKey } from '@/util/useFlash'
import useSWRMutation from 'swr/mutation'
import deleteAddressPool from '@/api/admin/addressPools/deleteAddressPool'
import { Address } from '@/api/server/getServer'
import { AddressResponse } from '@/api/admin/nodes/addresses/getAddresses'
import deleteAddress from '@/api/admin/addressPools/addresses/deleteAddress'
import { FormEvent } from 'react'
import Modal from '@/components/elements/Modal'
import MessageBox from '@/components/elements/MessageBox'
import FlashMessageRender from '@/components/elements/FlashMessageRenderer'

interface Props {
    address: Address | null
    onClose: () => void
    mutate: KeyedMutator<AddressResponse>
}

const DeleteAddressModal = ({ address, onClose, mutate }: Props) => {
    const { t } = useTranslation('admin.addressPools.addresses')
    const { t: tStrings } = useTranslation('strings')
    const { clearFlashes, clearAndAddHttpError } = useFlashKey(
        `admin.addressPools.${address?.addressPoolId}.addresses.${address?.id}.delete`
    )
    const { trigger, isMutating } = useSWRMutation(
        ['admin.address-pools.addresses.delete', address?.addressPoolId, address?.id],
        async () => {
            clearFlashes()
            try {
                await deleteAddress(address!.addressPoolId, address!.id)

                mutate(data => {
                    if (!data) return data

                    return {
                        ...data,
                        items: data.items.filter(item => item.id !== address!.id),
                    }
                }, false)

                onClose()
            } catch (e) {
                clearAndAddHttpError(e as Error)
                throw e
            }
        }
    )

    const submit = (e: FormEvent) => {
        e.preventDefault()
        trigger()
    }

    return (
        <Modal open={Boolean(address)} onClose={onClose}>
            <Modal.Header>
                <Modal.Title>{t('delete_modal.title')}</Modal.Title>
            </Modal.Header>

            <form onSubmit={submit}>
                <Modal.Body>
                    <FlashMessageRender
                        className='mb-5'
                        byKey={`admin.addressPools.${address?.addressPoolId}.addresses.${address?.id}.delete`}
                    />
                    <Modal.Description>
                        {t('delete_modal.description', { address: address?.address })}
                    </Modal.Description>
                </Modal.Body>

                <Modal.Actions>
                    <Modal.Action type='button' onClick={onClose}>
                        {tStrings('cancel')}
                    </Modal.Action>
                    <Modal.Action type='submit' loading={isMutating}>
                        {tStrings('delete')}
                    </Modal.Action>
                </Modal.Actions>
            </form>
        </Modal>
    )
}

export default DeleteAddressModal
