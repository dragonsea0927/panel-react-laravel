import PageContentBlock from '@/components/elements/PageContentBlock'
import Table, { Actions, ColumnArray, RowActionsProps } from '@/components/elements/displays/Table'
import { Token } from '@/api/admin/tokens/getTokens'
import { formatDistanceToNow } from 'date-fns'
import usePagination from '@/util/usePagination'
import useTokensSWR from '@/api/admin/tokens/useTokensSWR'
import Spinner from '@/components/elements/Spinner'
import Pagination from '@/components/elements/Pagination'
import { Link } from 'react-router-dom'
import CreateTokenButton from '@/components/admin/tokens/CreateTokenButton'
import { Node, NodeResponse } from '@/api/admin/nodes/getNodes'
import deleteNode from '@/api/admin/nodes/deleteNode'
import Menu from '@/components/elements/Menu'
import useFlash, { useFlashKey } from '@/util/useFlash'
import { useState } from 'react'
import deleteToken from '@/api/admin/tokens/deleteToken'
import Modal from '@/components/elements/Modal'
import { Code } from '@mantine/core'

const columns: ColumnArray<Token> = [
    {
        accessor: 'name',
        header: 'Name',
    },
    {
        accessor: 'user',
        header: 'Owner',
        cell: ({ value }) => (
            <Link to={`/admin/users/${value.id}/settings`} className='link text-foreground'>
                {value.email}
            </Link>
        ),
    },
    {
        accessor: 'lastUsedAt',
        header: 'Last Used At',
        cell: ({ value }) =>
            value
                ? formatDistanceToNow(value, {
                      includeSeconds: true,
                      addSuffix: true,
                  })
                : null,
    },
]

const TokensContainer = () => {
    const [page, setPage] = usePagination()
    const { data, mutate } = useTokensSWR({ page })
    const { clearFlashes, clearAndAddHttpError } = useFlashKey('admin:tokens')

    const rowActions = ({ row: token }: RowActionsProps<Token>) => {
        const [open, setOpen] = useState(false)
        const handleDelete = () => {
            clearFlashes()
            setOpen(false)

            deleteToken(token.id)
                .then(() => {
                    mutate(data => {
                        if (!data) return data

                        return {
                            ...data,
                            items: data.items.filter(tokenum => tokenum.id !== token.id),
                        }
                    })
                })
                .catch(error => {
                    clearAndAddHttpError(error as Error)
                })
        }

        return (
            <>
                <Modal open={open} onClose={() => setOpen(false)}>
                    <Modal.Header>
                        <Modal.Title>Delete {token.name}?</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Modal.Description>
                            Are you sure you want to delete this token? Subsequent requests to the API relying on this
                            token will immediately fail.
                        </Modal.Description>
                    </Modal.Body>
                    <Modal.Actions>
                        <Modal.Action onClick={() => setOpen(false)}>Cancel</Modal.Action>
                        <Modal.Action onClick={handleDelete}>Delete</Modal.Action>
                    </Modal.Actions>
                </Modal>
                <Actions>
                    <Menu.Item color='red' onClick={() => setOpen(true)}>
                        Delete
                    </Menu.Item>
                </Actions>
            </>
        )
    }

    return (
        <div className='bg-background min-h-screen'>
            <PageContentBlock title='Tokens' showFlashKey='admin:tokens'>
                <CreateTokenButton />
                {!data ? (
                    <Spinner />
                ) : (
                    <Pagination data={data} onPageSelect={setPage}>
                        {({ items }) => <Table rowActions={rowActions} columns={columns} data={items} />}
                    </Pagination>
                )}
            </PageContentBlock>
        </div>
    )
}

export default TokensContainer
