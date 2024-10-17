import { useEffect, useState } from 'react'
import { useDiscordSdk } from '../hooks/useDiscordSdk'
import { Editor, FillStyle, Shape, Text, type ShapeProps } from '@dgmjs/core';
import { DGMEditor } from '@dgmjs/react';
import data from './data.json';
import { Palette } from './palette';

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
		
		<DGMEditor
        className="absolute inset-0 border rounded-lg"
        onMount={handleMount}
        onShapeInitialize={handleShapeInitialize}
        onActiveHandlerChange={(handler) => setActiveHandler(handler)}
      />

<Palette onPropsChange={handlePropsChange} />
	  </>
	)
}
