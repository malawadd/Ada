import { useEffect, useState } from 'react'
import { useDiscordSdk } from '../hooks/useDiscordSdk'
import { Editor, Page, Shape, ShapeProps } from '@dgmjs/core'
import { YjsDocSyncPlugin, YjsUserPresencePlugin } from '@dgmjs/dgmjs-plugin-yjs'
import { nanoid } from 'nanoid'
import { PaletteToolbar } from '@/components/palette-toolbar'
import { useDemoStore } from './demo-store'
import { Options } from '@/components/options'
import { Menus } from '@/components/menus'
import { PropertySidebar } from '@/components/property-sidebar'
import fontJson from './fonts.json'
import { Font, fetchFonts, insertFontsToDocument } from './font-manager'
import { ShapeSidebar } from '@/components/shape-sidebar'
import { EditorWrapper } from './editor'
import { Button } from '@/components/ui/button'
import { SelectShapeDialog } from '@/components/dialogs/select-shape-dialog'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'

declare global {
	interface Window {
		editor: Editor
	}
}
export const Activity = () => {
	const { authenticated, discordSdk, status } = useDiscordSdk()
	const [channelName, setChannelName] = useState<string>()
	const [isTextFocused, setIsTextFocused] = useState(false)

	const urlSearchParams = new URLSearchParams(window.location.search)
	const params = Object.fromEntries(urlSearchParams.entries())
	const demoStore = useDemoStore()

	useEffect(() => {
		const focusinHandler = (e: FocusEvent) => {
			const target = e.target as HTMLElement
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
				setIsTextFocused(true)
			} else {
				setIsTextFocused(false)
			}
		}
		document.addEventListener('focusin', focusinHandler)
		return () => {
			document.removeEventListener('focusin', focusinHandler)
		}
	}, [])

	const handleMount = async (editor: Editor) => {
		window.editor = editor
		insertFontsToDocument(fontJson as Font[])
		await fetchFonts(fontJson as Font[])
		console.log('editor', editor)

		window.editor.newDoc()

		window.editor.transform.onTransaction.addListener(() => {
			// console.log("tx", tx);
		})
		window.editor.transform.onAction.addListener(() => {
			// console.log("action", action);
		})

		// load from local storage
		const localData = localStorage.getItem('local-data')
		if (localData) {
			window.editor.loadFromJSON(JSON.parse(localData))
		}
		demoStore.setDoc(window.editor.getDoc())
		demoStore.setCurrentPage(window.editor.getCurrentPage())
		// window.editor.fitToScreen();

		window.addEventListener('resize', () => {
			window.editor.fit()
		})
	}

	const handleSidebarSelect = (selection: Shape[]) => {
		window.editor.selection.select(selection)
	}

	const handleShapeCreate = (shape: Shape) => {
		if (!window.editor.getActiveHandlerLock()) {
			setTimeout(() => {
				window.editor.selection.select([shape])
				window.editor.repaint()
			}, 0)
		}
	}

	const handleSelectionChange = (selection: Shape[]) => {
		demoStore.setSelection([...selection])
	}

	const handleActiveHandlerChange = (handlerId: string) => {
		demoStore.setActiveHandler(handlerId)
		window.editor?.selection.deselectAll()
		window.editor?.focus()
	}
	const handleCurrentPageChange = (page: Page) => {
		demoStore.setCurrentPage(page)
	}
	const handleAction = () => {
		const data = window.editor.store.toJSON()
		localStorage.setItem('local-data', JSON.stringify(data))
	}

	const handleValuesChange = (values: ShapeProps) => {
		const shapes = window.editor.selection.getShapes();
		window.editor.actions.update(values);
		demoStore.setSelection([...shapes]);
	  };
	
	  const handlePageChange = (pageProps: Partial<Page>) => {
		const currentPage = window.editor.getCurrentPage();
		window.editor.actions.update(pageProps, [currentPage!]);
		demoStore.setCurrentPage(currentPage);
	  };
	
	
	


	useEffect(() => {
		// Requesting the channel in GDMs (when the guild ID is null) requires
		// the dm_channels.read scope which requires Discord approval.
		if (!authenticated || !discordSdk.channelId || !discordSdk.guildId) {
			return
		}

		// Collect channel info over RPC
		// Enable authentication to see it! (App.tsx)
		discordSdk.commands.getChannel({ channel_id: discordSdk.channelId }).then((channel) => {
			if (channel.name) {
				setChannelName(channel.name)
			}
		})
	}, [authenticated, discordSdk])

	return (
		<div className="absolute inset-0 h-[calc(100dvh)] select-none">
			<ContextMenu>
				<ContextMenuTrigger disabled={isTextFocused}>
					<EditorWrapper
						className="absolute inset-y-0 left-56 right-56"
						darkMode={demoStore.darkMode}
						options={{
							showDOM: true,
							keymapEventTarget: window,
							imageResize: {
								quality: 1,
								maxWidth: 2800,
								maxHeight: 2800
							}
						}}
						plugins={[new YjsDocSyncPlugin(), new YjsUserPresencePlugin()]}
						showGrid={true}
						onMount={handleMount}
						onShapeCreate={handleShapeCreate}
						onSelectionChange={handleSelectionChange}
						onCurrentPageChange={handleCurrentPageChange}
						onActiveHandlerChange={handleActiveHandlerChange}
						onActiveHandlerLockChange={(lock) => demoStore.setActiveHandlerLock(lock)}
						onAction={handleAction}
					/>
				</ContextMenuTrigger>
				<ContextMenuContent>
					<ContextMenuItem>Context Menu 1</ContextMenuItem>
					<ContextMenuItem>Context Menu 2</ContextMenuItem>
					<ContextMenuItem>Context Menu 3</ContextMenuItem>
					<ContextMenuItem>Context Menu 4</ContextMenuItem>
				</ContextMenuContent>
			</ContextMenu>

			<div className="absolute left-60 right-60 top-2 flex h-10 items-center justify-between border bg-background">
				<Menus />
				<Options />
			</div>
			<PaletteToolbar />
			<ShapeSidebar
				doc={demoStore.doc!}
				currentPage={demoStore.currentPage}
				onSelect={handleSidebarSelect}
				onPageSelect={(page) => {
					window.editor.setCurrentPage(page)
				}}
			/>
			<PropertySidebar
        doc={demoStore.doc!}
        currentPage={demoStore.currentPage!}
        shapes={demoStore.selection}
        onChange={handleValuesChange}
        onPageChange={handlePageChange}
      />
      <SelectShapeDialog />
		</div>
	)
}
