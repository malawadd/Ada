import { useEffect, useState, useRef  } from 'react'
import { useDiscordSdk } from '../hooks/useDiscordSdk'
import { Editor, Page, Shape, ShapeProps, Image, ShapeFactory } from '@dgmjs/core'
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
import { Input } from '@/components/ui/input'
import { generateImageFromPrompt } from '@/api/livepeer';
import { collab, generateUserIdentity } from "./collab";

declare global {
	interface Window {
		editor: Editor
		addImageFromURL: (url: string) => Promise<void>
	}
}
export const Activity = () => {
	const { authenticated, discordSdk, status } = useDiscordSdk()
	const [channelName, setChannelName] = useState<string>()
	const [isTextFocused, setIsTextFocused] = useState(false)
	const [imageUrl, setImageUrl] = useState('')
	const [showInput, setShowInput] = useState(false)
	const [loading, setLoading] = useState(false);
	const [model, setModel] = useState('ByteDance/SDXL-Lightning');
	const [prompt, setPrompt] = useState('');
	const inputRef = useRef<HTMLDivElement>(null);
	const [sharing, setSharing] = useState(false); 

	const urlSearchParams = new URLSearchParams(window.location.search)
	const params = Object.fromEntries(urlSearchParams.entries())
	const demoStore = useDemoStore()
	const roomId = params.roomId;

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

		if (roomId) {
			collab.start(window.editor, roomId, generateUserIdentity());
			console.log("collab started with roomId", roomId);
		  } else {
			window.editor.newDoc();
		  }

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

		collab.oDocReady.addListener(() => {
			const doc = window.editor.getDoc();
			if (doc) {
			  demoStore.setDoc(doc);
			  demoStore.setCurrentPage(window.editor.getCurrentPage());
			}
		  });
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
		const shapes = window.editor.selection.getShapes()
		window.editor.actions.update(values)
		demoStore.setSelection([...shapes])
	}

	const handlePageChange = (pageProps: Partial<Page>) => {
		const currentPage = window.editor.getCurrentPage()
		window.editor.actions.update(pageProps, [currentPage!])
		demoStore.setCurrentPage(currentPage)
	}

	// Add image from URL
	const addImageFromURL = async (url: string) => {
		if (window.editor) {
		  const shapeFactory = new ShapeFactory(window.editor);
		  const response = await fetch(url);
		  const blob = await response.blob();
		  const blobUrl = URL.createObjectURL(blob);
	  
		  try {
			const imageShape = await shapeFactory.createImage(blob, [0, 0]);
			window.editor.actions.insert(imageShape);
		  } catch (error) {
			console.error('Error adding image:', error);
		  } finally {
			// Revoke the Blob URL after use to free up memory
			URL.revokeObjectURL(blobUrl);
		  }
		}
	  };

	useEffect(() => {
		// Register globally for the palette to access
		window.addImageFromURL = addImageFromURL
	}, [])

	const handleGenerateImage = async () => {
		if (!prompt) return;
	
		setLoading(true);
	
		const imageUrl = await generateImageFromPrompt({
		  modelId: model,
		  prompt,
		});
	
		setLoading(false);
	
		if (imageUrl) {
		  window.addImageFromURL(imageUrl);
		  setShowInput(false);
		  setPrompt('');
		} else {
		  alert('Failed to generate image. Please try again.');
		}
	  };

	const handleAddImage = () => {
		if (imageUrl && window.addImageFromURL) {
			window.addImageFromURL(imageUrl)
			setShowInput(false)
			setImageUrl('')
		}
	}

	  // Handle closing the overlay
	  const handleCloseOverlay = () => {
		setShowInput(false);
		setPrompt('');
	  };
	
	  // Close overlay when clicking outside the input area
	  useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
		  if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
			handleCloseOverlay();
		  }
		};
	
		if (showInput) {
		  document.addEventListener('mousedown', handleClickOutside);
		} else {
		  document.removeEventListener('mousedown', handleClickOutside);
		}
	
		return () => {
		  document.removeEventListener('mousedown', handleClickOutside);
		};
	  }, [showInput]);

	  const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !loading) {
		  handleGenerateImage();
		}
	  };

	  const handleShare = () => {
		const roomId = nanoid();
		collab.start(window.editor, roomId!, generateUserIdentity());
		collab.flush();
		window.history.pushState({}, "", `?roomId=${roomId}`);
	  };
	
	  const handleShareStop = () => {
		collab.stop();
		window.history.pushState({}, "", "/");
	  };

	  const handleShareToggle = () => {
		if (!sharing) {
		  // Start sharing
		  const roomId = nanoid();
		  collab.start(window.editor, roomId, generateUserIdentity());
		  collab.flush();
		  window.history.pushState({}, '', `?roomId=${roomId}`);
		} else {
		  // Stop sharing
		  collab.stop();
		  window.history.pushState({}, '', '/');
		}
		setSharing(!sharing); // Toggle sharing state
	  };

	  // Watch for URL changes to set the initial sharing state
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('roomId');
    setSharing(!!roomId); // Set sharing to true if roomId is present

    // Listen for URL changes (e.g., when another user joins/leaves)
    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      const currentRoomId = currentParams.get('roomId');
      setSharing(!!currentRoomId);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
	



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
				
				<Button
          onClick={handleShareToggle}
          className={`py-2 px-4 rounded ${
            sharing ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
          }`}
        >
          {sharing ? 'Stop' : 'Share'}
        </Button>
				
			</div>

			{showInput && (
        <div className={`absolute inset-0 flex items-center justify-center z-50 `}>
          <div
            ref={inputRef}
            className={`flex flex-col items-center p-6 rounded-lg shadow-lg ${
              demoStore.darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
            }`}
          >
            <Input
              type="text"
              placeholder="Enter image prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className={`mb-4 w-72 ${demoStore.darkMode ? 'bg-gray-700 text-white placeholder-gray-400' : 'bg-white text-black placeholder-gray-500'}`}
            />
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className={`mb-4 w-72 p-2 border rounded ${demoStore.darkMode ? 'bg-gray-700 text-white' : 'bg-white text-black'}`}
            >
              <option value="ByteDance/SDXL-Lightning">ByteDance/SDXL-Lightning</option>
              <option value="SG161222/RealVisXL_V4.0_Lightning">SG161222/RealVisXL_V4.0_Lightning</option>
            </select>
            <div className="flex gap-4">
              <button
                onClick={handleGenerateImage}
                className={`py-2 px-4 rounded-lg ${demoStore.darkMode ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Image'}
              </button>
              <button
                onClick={() => setShowInput(false)}
                className={`py-2 px-4 rounded-lg ${demoStore.darkMode ? 'bg-gray-600 hover:bg-gray-700 text-white' : 'bg-gray-300 hover:bg-gray-400 text-black'}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

			<PaletteToolbar onShowInput={() => setShowInput(true)} />

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
