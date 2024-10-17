import { useEffect, useState } from 'react'
import { useDiscordSdk } from '../hooks/useDiscordSdk'
import { Editor, FillStyle, Shape, Text, type ShapeProps } from '@dgmjs/core';
import { DGMEditor } from '@dgmjs/react';
import data from './data.json';
import { Palette } from './palette';
import { useDemoStore } from "./demo-store";
import { Menus } from "@/components/menus";
import { PaletteToolbar } from "@/components/palette-toolbar";
import { ShapeSidebar } from "@/components/shape-sidebar";

declare global {
	interface Window {
	  editor: Editor;
	}
  }
export const Activity = () => {
	const { authenticated, discordSdk, status } = useDiscordSdk()
	const [channelName, setChannelName] = useState<string>()
	const [editor, setEditor] = useState<Editor | null>(null);
	const [activeHandler, setActiveHandler] = useState<string>('Select');
	const demoStore = useDemoStore();

	const handleMount = async (editor: Editor) => {
	  window.editor = editor;
	  setEditor(editor);
	  editor.loadFromJSON(data);
	  editor.fitToScreen();
	  window.addEventListener('resize', () => {
		editor.fit();
	  });
	};
  
	const handleShapeInitialize = (shape: Shape) => {
	  shape.fillStyle =
		shape instanceof Text ? FillStyle.NONE : FillStyle.HACHURE;
	  shape.fillColor = '$green6';
	  shape.fontFamily = 'Gloria Hallelujah';
	  shape.fontSize = 20;
	  shape.roughness = 1;
	};
  
	const handlePropsChange = (props: ShapeProps) => {
	  window.editor.actions.update(props);
	};

	demoStore.setDoc(window.editor.getDoc());
    demoStore.setCurrentPage(window.editor.getCurrentPage());

	const handleSidebarSelect = (selection: Shape[]) => {
		window.editor.selection.select(selection);
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
		<>
		<div className="m-0 flex min-h-screen min-w-80 flex-col place-items-center justify-center">
			<img src="/rocket.png" className="my-4 h-24 duration-300 hover:drop-shadow-[0_0_2em_#646cff]" alt="Discord" />
			<h1 className="my-4 text-5xl font-bold">Hello, World</h1>
			<h3 className="my-4 font-bold">{channelName ? `#${channelName}` : status}</h3>
			
		</div>
		
		<div className="absolute top-2 left-60 right-60 h-10 border flex items-center justify-between bg-background">
        <Menus />
		
        
      </div>
	  <PaletteToolbar/>
	  <ShapeSidebar
       doc={demoStore.doc!}
        currentPage={demoStore.currentPage}
        onSelect={handleSidebarSelect}
        onPageSelect={(page) => {
          window.editor.setCurrentPage(page);
        }}
      />

<Palette onPropsChange={handlePropsChange} />
	  </>
	)
}
