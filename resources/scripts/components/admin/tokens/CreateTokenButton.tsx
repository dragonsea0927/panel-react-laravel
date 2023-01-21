import { useState } from 'react'
import usePagination from '@/util/usePagination'
import { useFlashKey } from '@/util/useFlash'
import useUsersSWR from '@/api/admin/users/useUsersSWR'
import { FormikProvider, useFormik } from 'formik'
import * as yup from 'yup'
import createUser from '@/api/admin/users/createUser'
import { UserResponse } from '@/api/admin/users/getUsers'
import useTokensSWR from '@/api/admin/tokens/useTokensSWR'
import createToken from '@/api/admin/tokens/createToken'
import { Token, TokenResponse } from '@/api/admin/tokens/getTokens'
import Button from '@/components/elements/Button'
import Modal from '@/components/elements/Modal'
import FlashMessageRender from '@/components/elements/FlashMessageRenderer'
import TextInputFormik from '@/components/elements/forms/TextInputFormik'
import CheckboxFormik from '@/components/elements/forms/CheckboxFormik'
import MessageBox from '@/components/elements/MessageBox'
import PlainTextTokenModal from '@/components/admin/tokens/PlainTextTokenModal'

const CreateTokenButton = () => {
    const [open, setOpen] = useState(false)
    const [page] = usePagination()
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('admin:tokens.create')
    const { mutate } = useTokensSWR({ page })
    const [token, setToken] = useState<Token | null>(null)

    const form = useFormik({
        initialValues: {
            name: '',
        },
        validationSchema: yup.object({
            name: yup.string().max(191, 'Do not exceed 191 characters').required('A name is required.'),
        }),
        onSubmit: async values => {
            clearFlashes()
            try {
                const { plainTextToken, ...token } = await createToken(values)

                mutate(data => {
                    if (!data) return data

                    return {
                        ...data,
                        items: [token, ...data.items],
                    } as TokenResponse
                }, false)

                setToken({ plainTextToken, ...token })

                handleClose()
            } catch (e) {
                clearAndAddHttpError(e as Error)
            }
        },
    })

    const handleClose = () => {
        clearFlashes()
        form.resetForm()
        setOpen(false)
    }

    return (
        <div className='flex justify-end items-center mb-3'>
            <Button onClick={() => setOpen(true)} variant='filled'>
                New Token
            </Button>
            <PlainTextTokenModal value={token} onClose={() => setToken(null)} />
            <Modal open={open} onClose={handleClose}>
                <Modal.Header>
                    <Modal.Title>Create a Token</Modal.Title>
                </Modal.Header>

                <FormikProvider value={form}>
                    <form onSubmit={form.handleSubmit}>
                        <Modal.Body>
                            <FlashMessageRender className='mb-5' byKey={'admin:tokens.create'} />
                            <TextInputFormik name={'name'} label={'Name'} />
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
        </div>
    )
}

export default CreateTokenButton
