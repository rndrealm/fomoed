<script lang="ts">
	let props: { onclick?: () => void; class?: string } = $$props;
</script>

<a
	onclick={props.onclick}
	href="/news"
	class="{$$props.class} uppercase h-[50px] justify-center font-paralucent-heavy border-[#FFFFFF1A] border rounded-[11px] px-8 flex items-center text-[#FFFFFFCC] hover:bg-[#FFFFFF0D] hover:border-[#FFFFFF4D]"
>
	News
</a>
