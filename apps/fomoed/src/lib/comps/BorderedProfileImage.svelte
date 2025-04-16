<script>
	import { auth_user } from '$lib/stores/user';

	$: premium = $auth_user?.has_valid_sub;
</script>

<div
	id="profile-img-container"
	class:premium
	class="bg-[#221F1D] aspect-square grid place-items-center rounded-[15%] overflow-hidden border border-transparent relative"
>
	<img src="/images/indicator-meme-5.png" class="w-[65%]" alt="Arrow right" />

	{#if premium}
		<img
			class="absolute left-[2.5%] bottom-[2.5%] w-[20%] aspect-square z-10"
			src="/icons/star.svg"
			alt=""
		/>
	{/if}
</div>

<style>
	#profile-img-container {
		@apply relative;
	}

	#profile-img-container.premium {
		background:
			linear-gradient(#201e1e, #201e1e) padding-box,
			linear-gradient(90deg, #ff3b10 0%, #f3c111 71.5%) border-box;
	}

	#profile-img-container.premium::after {
		@apply absolute left-0 bottom-0 rounded-tr-[50%] bg-no-repeat bg-center bg-cover;
		@apply w-[26%] h-[26%] aspect-square;
		content: '';
		background: linear-gradient(90deg, #ff3b10 0%, #f3c111 71.5%);
	}
</style>
