<script lang="ts">
	import { Avatar, AvatarImage, AvatarFallback } from '$lib/components/ui/avatar';
	import { User } from 'lucide-svelte';

	type SocialLinks = {
		linkedin?: string;
		twitter?: string;
		facebook?: string;
	};

	let {
		authorName,
		authorTitle = 'Post writer',
		authorBio,
		authorImageUrl,
		socialLinks = {}
	} = $props<{
		authorName?: string | null;
		authorTitle?: string;
		authorBio?: string;
		authorImageUrl?: string;
		socialLinks?: SocialLinks;
	}>();
</script>

<div class="p-4 bg-[#151515] rounded-lg border-[0.5px] border-[#333333] px-3">
	<!-- Label -->
	<div class="text-sm tracking-wider text-new-white font-semibold font-inter">Author</div>

	<div
		class="flex justify-between items-start border-[0.5px] border-[#333333] rounded-lg mt-3 py-3 px-3"
	>
		<!-- Name & Title section -->
		<div class="flex items-center gap-3">
			<Avatar class="h-10 w-10">
				<AvatarImage src={authorImageUrl} alt={authorName || 'Author'} />
				<AvatarFallback>
					<User class="h-5 w-5" />
				</AvatarFallback>
			</Avatar>

			<div>
				<h2 class="font-bold text-white font-inter">{authorName || 'Unknown Author'}</h2>
				<p class="text-sm text-gray-300">{authorTitle}</p>
			</div>
		</div>

		<!-- Social Icons -->
		{#if false}
			<div class="flex items-center space-x-3">
				<!-- LinkedIn -->
				{#if socialLinks.linkedin !== undefined}
					<a
						href={socialLinks.linkedin}
						class="text-gray-400 hover:text-blue-400"
						aria-label="LinkedIn"
					>
						<!-- TODO: Add LinkedIn icon SVG -->
						<div class="w-5 h-5 bg-current"></div>
					</a>
				{:else}
					<a href="#" class="text-gray-400 hover:text-blue-400" aria-label="LinkedIn">
						<!-- TODO: Add LinkedIn icon SVG -->
						<div class="w-5 h-5 bg-current"></div>
					</a>
				{/if}

				<!-- X (formerly Twitter) -->
				{#if socialLinks.twitter !== undefined}
					<a href={socialLinks.twitter} class="text-gray-400 hover:text-blue-400" aria-label="X">
						<!-- TODO: Add X/Twitter icon SVG -->
						<div class="w-5 h-5 bg-current"></div>
					</a>
				{:else}
					<a href="#" class="text-gray-400 hover:text-blue-400" aria-label="X">
						<!-- TODO: Add X/Twitter icon SVG -->
						<div class="w-5 h-5 bg-current"></div>
					</a>
				{/if}

				<!-- Facebook -->
				{#if socialLinks.facebook !== undefined}
					<a
						href={socialLinks.facebook}
						class="text-gray-400 hover:text-blue-400"
						aria-label="Facebook"
					>
						<!-- TODO: Add Facebook icon SVG -->
						<div class="w-5 h-5 bg-current"></div>
					</a>
				{:else}
					<a href="#" class="text-gray-400 hover:text-blue-400" aria-label="Facebook">
						<!-- TODO: Add Facebook icon SVG -->
						<div class="w-5 h-5 bg-current"></div>
					</a>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Description -->
	<p class="pt-3 text-new-white text-sm font-inter pl-1">
		{authorBio || 'This user has no BIO available.'}
	</p>
</div>
