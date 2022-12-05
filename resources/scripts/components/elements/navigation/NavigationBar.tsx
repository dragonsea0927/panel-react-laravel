import ContentContainer from '@/components/elements/ContentContainer'
//@ts-ignore
import Logo from '@/assets/images/logo.svg'
import { Burger, LoadingOverlay } from '@mantine/core'
import UserDropdown from '@/components/elements/navigation/UserDropdown'
import { useEffect, useMemo, useRef, useState } from 'react'
import NavigationDropdown from '@/components/elements/navigation/NavigationDropdown'
import { Link, useMatch } from 'react-router-dom'
import http from '@/api/http'
import NavLink from '@/components/elements/navigation/NavLink'

interface RouteDefinition {
    name: string
    path: string
}

interface Props {
    routes: RouteDefinition[]
    breadcrumb?: string
}

const NavigationBar = ({ routes, breadcrumb }: Props) => {
    const [isVisible, setIsVisible] = useState(true)
    const [menuVisible, setMenuVisible] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const topBar = useRef(null)
    const bottomBar = useRef<HTMLDivElement>(null)
    const placeholder = useRef<HTMLDivElement>(null)
    const logo = useRef<HTMLDivElement>(null)
    const isAdminArea = useMatch('/admin/*')

    const visibilityObserver = useMemo(
        () => new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting)),
        []
    )

    useEffect(() => {
        const resizeListener = () => {
            let width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth

            if (width < 640) {
                setMenuVisible(false)
            }
        }

        //@ts-ignore
        visibilityObserver.observe(topBar.current)

        window.addEventListener('resize', resizeListener)

        return () => {
            visibilityObserver.disconnect()
            window.removeEventListener('resize', resizeListener)
        }
    }, [])

    useEffect(() => {
        if (logo.current && bottomBar.current && placeholder.current) {
            if (!isVisible) {
                bottomBar.current.classList.add('fixed', 'top-0', '!shadow-lg')
                logo.current.classList.add('!w-12')
                placeholder.current.classList.remove('hidden')
            } else {
                bottomBar.current.classList.remove('fixed', 'top-0', '!shadow-lg')
                logo.current.classList.remove('!w-12')
                placeholder.current.classList.add('hidden')
            }
        }
    }, [isVisible])

    const logout = () => {
        setIsLoggingOut(true)
        http.post('/logout').finally(() => {
            // @ts-expect-error
            window.location = '/'
        })
    }

    return (
        <div className='bg-white w-full dark:bg-black'>
            <LoadingOverlay visible={isLoggingOut} zIndex={4000} />
            <ContentContainer ref={topBar} className='pt-3 pb-1.5 relative'>
                <div className='flex justify-between'>
                    <div className='flex space-x-5 items-center'>
                        <Link to={isAdminArea ? '/admin' : '/'} className='flex items-center space-x-3'>
                            <img src={Logo} className='w-7 h-7 dark:invert' alt='Convoy logo' />
                            <h1 className='font-semibold text-lg text-foreground'>Convoy</h1>
                        </Link>
                        {breadcrumb && (
                            <>
                                <div className='py-1.5 h-full'>
                                    <div className='rotate-[25deg] w-[2px] h-full bg-[#eaeaea] dark:bg-[#333] rounded-full' />
                                </div>
                                <p className='font-medium text-sm text-foreground text-ellipsis overflow-hidden whitespace-nowrap'>
                                    {breadcrumb}
                                </p>
                            </>
                        )}
                    </div>

                        <UserDropdown logout={logout} />
                        <Burger className='block sm:hidden' opened={menuVisible} onClick={() => setMenuVisible(!menuVisible)} />
                </div>
            </ContentContainer>
            <NavigationDropdown logout={logout} visible={menuVisible} />
            <div
                ref={bottomBar}
                className='bg-white shadow-none transition-shadow dark:bg-black w-full border-b border-accent-200 z-[2000]'
            >
                <ContentContainer className='flex w-full'>
                    <div
                        className='grid place-items-center transition-all w-0 inset-y-0 overflow-hidden'
                        ref={logo}
                        style={{
                            transition: 'width 0.25s ease',
                        }}
                    >
                        <img src={Logo} className='w-6 h-6 dark:invert' alt='Convoy logo' />
                    </div>
                    <div className='flex z-[2000] overflow-x-auto scrollbar-hide'>
                        {routes.map(route => (
                            <NavLink key={route.path} to={route.path}>
                                {route.name}
                            </NavLink>
                        ))}
                    </div>
                </ContentContainer>
            </div>
            <div ref={placeholder} className='hidden h-[49px] w-full bg-white dark:bg-black' />
        </div>
    )
}

export default NavigationBar
