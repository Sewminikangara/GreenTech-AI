import os

# Define the knowledge documents database mapping details
DOCS = {
    # 1. Green Electronics (10 articles)
    "green_electronics/basics.md": {
        "title": "Introduction to Green Electronics",
        "category": "green_electronics",
        "research_factor": "green_product_awareness",
        "source_type": "Environmental Organization",
        "source": "UN Environment Programme (UNEP)",
        "keywords": "eco-labeled hardware, green electronics, sustainable design, repairability",
        "content": """# Basics of Green Electronics

Green electronics refer to computing devices and hardware designed, manufactured, used, and disposed of in ways that minimize environmental degradation. In the context of IT undergraduates, recognizing these features is the first step toward eco-responsible procurement.

### Primary Characteristics
1. **Energy Efficiency**: Minimizing electricity draw during active use and idle modes (e.g., Energy Star requirements).
2. **Sustainable Materials**: Using non-toxic, recycled, or bio-based substances instead of hazardous heavy metals like lead or mercury.
3. **Product Longevity**: Building robust hardware with long replacement cycles to reduce demand on raw materials.
4. **Repairability & Modularity**: Allowing users to upgrade specific components (like RAM, storage, or batteries) without discarding the whole unit.
5. **Responsible Recycling**: Designing devices so they can be easily disassembled for precious metal recovery.

Understanding these traits helps bridge information asymmetry when choosing hardware, aligning intent with positive ecological outcomes."""
    },
    "green_electronics/sustainable_design.md": {
        "title": "Sustainable Design in Modern Computing",
        "category": "green_electronics",
        "research_factor": "green_product_awareness",
        "source_type": "Manufacturer Sustainability Report",
        "source": "TCO Certified Hardware Standards",
        "keywords": "circular design, modular laptop, post-consumer plastic, modularity",
        "content": """# Sustainable Design in Modern Computing

Sustainable hardware design focuses on the life-cycle of a device from extraction to end-of-life. It represents a shift from linear manufacturing to circular product design.

### Structural Pillars of Eco-Design
- **Modular Frameworks**: Laptops and smartphones designed with easily accessible screws and swappable parts. Users can replace a degraded battery or a keyboard without throwing away the motherboard.
- **Post-Consumer Recycled (PCR) Plastics**: Sourcing plastic from recycled water bottles or ocean waste to manufacture device shells.
- **Reduction of Flame Retardants (BFRs/CFRs)**: Eliminating halogenated substances that release toxic fumes if the device is heated or burned.
- **Solder Alternatives**: Using low-temperature lead-free solder alloys to ease component extraction during recovery processes.

When IT students look for modularity, they support circular manufacturing concepts that actively reduce carbon footprint."""
    },
    "green_electronics/energy_efficiency.md": {
        "title": "Energy Efficiency in Computing Hardware",
        "category": "green_electronics",
        "research_factor": "perceived_benefits",
        "source_type": "Government Guideline",
        "source": "US EPA Energy Star Specification",
        "keywords": "electricity, energy star, standby power, battery efficiency",
        "content": """# Energy Efficiency in Computing Hardware

Energy efficiency is a key independent variable determining the perceived benefit of a green device. Efficient devices directly translate to lower utility bills and reduced load on the electricity grid.

### Key Metrics and Features
- **Active Power Draw**: The wattage consumed during intensive processing. High-efficiency processors use thermal throttling and dynamic voltage scaling to reduce active power.
- **Standby/Sleep States**: Modern standby modes should consume less than 1-2 watts. Devices must wake rapidly while avoiding background battery drain.
- **80 Plus Certification**: For desktop PCs and lab workstations, power supply units (PSUs) must convert AC to DC with at least 80% efficiency across all load tiers.

In developing nations like Sri Lanka, where electricity tariffs have fluctuated significantly, buying an energy-efficient laptop provides a direct financial return on investment (ROI)."""
    },
    "green_electronics/device_lifespan.md": {
        "title": "Extending Device Lifespan and Utility",
        "category": "green_electronics",
        "research_factor": "perceived_benefits",
        "source_type": "Research Paper",
        "source": "Journal of Cleaner Production",
        "keywords": "durability, upgrade path, battery health, lifespan extension",
        "content": """# Extending Device Lifespan and Utility

Extending the operational lifespan of electronic hardware is one of the most effective ways to mitigate its environmental impact. Manufacturing a new laptop generates significant embodied carbon.

### Lifespan Extension Strategies
1. **RAM and SSD Upgradeability**: Buying laptops with non-soldered slots allows students to upgrade storage and memory as computing requirements grow.
2. **Battery Maintenance**: Using smart charging caps (e.g., limiting charge to 80%) preserves lithium-ion battery health over multiple years.
3. **Software Optimization**: Using lightweight operating systems (like Linux distributions) on older hardware prevents premature disposal.

Promoting upgradeability reduces the electronic footprint and mitigates the high acquisition costs of brand-new computers."""
    },
    "green_electronics/certifications.md": {
        "title": "Eco-Certifications for Tech Hardware",
        "category": "green_electronics",
        "research_factor": "environmental_knowledge",
        "source_type": "Environmental Organization",
        "source": "Global Ecolabelling Network",
        "keywords": "EPEAT, TCO Certified, Energy Star, ecolabels",
        "content": """# Eco-Certifications for Tech Hardware

Ecolabels provide verified third-party assurances that a device complies with strict ecological standards, helping consumers avoid greenwashing.

### Major International Standards
- **EPEAT (Electronic Product Environmental Assessment Tool)**: Evaluates laptops, monitors, and phones on a Bronze, Silver, and Gold scale across criteria like toxic material limits and circular design.
- **TCO Certified**: Focuses on social responsibility in the supply chain, conflict-free minerals, and ergonomic design, alongside energy metrics.
- **RoHS Compliance**: Restriction of Hazardous Substances. Assures the device contains minimal levels of lead, mercury, cadmium, and hexavalent chromium.

Environmental knowledge regarding ecolabels empowers IT undergraduates to specify sustainable hardware in purchase tenders."""
    },
    "green_electronics/hardware_circularity.md": {
        "title": "Hardware Circularity and Closed-Loop Systems",
        "category": "green_electronics",
        "research_factor": "green_product_awareness",
        "source_type": "Research Paper",
        "source": "Ellen MacArthur Foundation circularity reports",
        "keywords": "closed-loop, raw materials, recycling loop, circular economy",
        "content": """# Hardware Circularity and Closed-Loop Systems

Closed-loop manufacturing systems reclaim raw materials from end-of-life electronics and feed them back into the production line of new hardware.

### Features of Closed-Loop systems
- **Precious Metal Recovery**: Reclaiming gold, silver, and copper from circuit boards to manufacture new contact pins.
- **Closed-Loop Plastics**: Melting old housings to mold new bezels and frames.
- **Manufacturer Take-Back Programs**: Companies collecting their own products at end-of-life to process them in controlled recycling centers.

Support for closed-loop products directly impacts green purchase intention, as buyers feel their decisions contribute to zero-waste goals."""
    },
    "green_electronics/energy_conservation.md": {
        "title": "Energy Conservation in Academic Workstations",
        "category": "green_electronics",
        "research_factor": "environmental_concern",
        "source_type": "Government Guideline",
        "source": "Sri Lanka Sustainable Energy Authority",
        "keywords": "smart power, workstation energy, power management, carbon offset",
        "content": """# Energy Conservation in Academic Workstations

Academic computing labs consume significant electricity. Managing workstation configurations helps reduce campus grid emissions and operating costs.

### Effective Energy Management
- **Wake-on-LAN**: Configured so servers can wake workstations for night-time patches and put them back to sleep immediately.
- **Display Sleep Times**: Setting monitor standbys to 5-10 minutes of inactivity.
- **Smart Power Strips**: Automatically cutting peripheral power (monitors, printers) when the main desktop PC is shut down.

IT students play a key role in advocating for these configurations in university labs, utilizing environmental knowledge to drive campus energy policy."""
    },
    "green_electronics/embodied_carbon.md": {
        "title": "Embodied Carbon in Silicon Production",
        "category": "green_electronics",
        "research_factor": "environmental_knowledge",
        "source_type": "Research Paper",
        "source": "IEEE Transactions on Sustainable Computing",
        "keywords": "silicon wafer, embodied carbon, manufacturing emissions, greenhouse gas",
        "content": """# Embodied Carbon in Silicon Production

Up to 80% of a laptop's lifetime carbon footprint is generated during manufacturing, primarily in raw material extraction and silicon refining.

### The Footprint Breakdown
- **Quartz Reduction**: Melting silicon quartz at high temperatures in electric arc furnaces requires significant energy.
- **Cleanroom HVAC**: Maintaining cleanroom environments for microchip manufacturing runs massive HVAC systems 24/7.
- **Global Transport**: Shipping delicate wafers across several continents before assembly increases fuel emissions.

Understanding embodied carbon highlights that buying fewer, higher-quality, upgradeable devices is far greener than buying cheap, disposable laptops."""
    },
    "green_electronics/device_repairability.md": {
        "title": "Repairability and the Right to Repair",
        "category": "green_electronics",
        "research_factor": "perceived_barriers",
        "source_type": "Government Guideline",
        "source": "EU Right to Repair Directive",
        "keywords": "repair index, replacement parts, local repair, hardware maintenance",
        "content": """# Repairability and the Right to Repair

Lack of access to repair manuals and replacement parts represents a significant barrier to green electronics adoption.

### Indicators of High Repairability
- **Standard Fasteners**: Devices secured with standard Torx or Phillips screws rather than proprietary rivets or glue.
- **Component Access**: Removable cases allowing quick access to cooling fans, batteries, and storage modules.
- **Part Availability**: Manufacturers maintaining spare part inventories and offering public repair documentation.

In Sri Lanka, where replacement parts are often imported, choosing highly repairable designs helps ensure local repair shops can extend device lifespans."""
    },
    "green_electronics/green_datacenters.md": {
        "title": "Green Cloud Computing and Server Efficiency",
        "category": "green_electronics",
        "research_factor": "environmental_knowledge",
        "source_type": "Research Paper",
        "source": "Journal of Systems and Software",
        "keywords": "PUE, cloud emissions, green server, datacenter cooling",
        "content": """# Green Cloud Computing and Server Efficiency

As software development moves to the cloud, the environmental impact of code execution shifts to data centers.

### Key Datacenter Metrics
- **PUE (Power Usage Effectiveness)**: The ratio of total datacenter facility energy to the energy delivered to computing equipment. Ideal PUE is close to 1.0.
- **Renewable Energy Matching**: Datacenters running on solar, wind, or hydroelectric power.
- **Server Virtualization**: Hosting multiple logical machines on one physical box to increase hardware utilization.

IT undergraduates must understand that hosting code on green cloud platforms is an integral component of sustainable software design."""
    },

    # 2. E-Waste (5 articles)
    "e_waste/introduction.md": {
        "title": "The Global and Local E-Waste Crisis",
        "category": "e_waste",
        "research_factor": "environmental_concern",
        "source_type": "Environmental Organization",
        "source": "UN Global E-waste Monitor",
        "keywords": "e-waste growth, toxic metals, landfill waste, electronic refuse",
        "content": """# The E-Waste Crisis

Electronic waste (E-waste) is the fastest-growing waste stream globally. Improperly managed e-waste represents a significant threat to health and ecosystems.

### E-Waste Composition
- **Valuable Materials**: Gold, silver, copper, and cobalt found in circuit boards.
- **Toxic Pollutants**: Lead in cathode ray tubes, cadmium in older chip resistors, and mercury in backlights.

In developing nations, informal recycling methods (like open-air burning of cables to extract copper) release highly toxic dioxins and heavy metals into soil and water tables. Recognizing these impacts increases environmental concern and motivates users to support formal recycling programs."""
    },
    "e_waste/recycling.md": {
        "title": "Formal E-Waste Recycling Methods",
        "category": "e_waste",
        "research_factor": "environmental_knowledge",
        "source_type": "Government Guideline",
        "source": "EPA Electronic Waste Guidelines",
        "keywords": "shredding, sorting, heavy metal capture, precious metal recovery",
        "content": """# Formal E-Waste Recycling Methods

Formal e-waste recycling utilizes advanced engineering processes to recover valuable materials safely without harming the environment.

### Steps in Formal Recycling
1. **Manual Disassembly**: Isolating batteries, circuit boards, and toxic materials (mercury lamps).
2. **Shredding and Sorting**: Crushing components and using magnetic separators, air classifiers, and eddy current separators to sort plastics, iron, and non-ferrous metals.
3. **Pyrometallurgy & Hydrometallurgy**: Refining crushed boards in specialized smelters or acid baths to extract pure copper, gold, and palladium.

This process reduces the demand for raw mining, preserving natural habitats and lowering greenhouse gas emissions."""
    },
    "e_waste/responsible_disposal.md": {
        "title": "Responsible E-Waste Disposal in Sri Lanka",
        "category": "e_waste",
        "research_factor": "environmental_knowledge",
        "source_type": "Government Guideline",
        "source": "Central Environmental Authority (CEA) Sri Lanka",
        "keywords": "CEA licensing, e-waste drop-off, colombo recycling, take-back schemes",
        "content": """# Responsible E-Waste Disposal in Sri Lanka

In Sri Lanka, disposal of electronic waste is regulated under the National Environmental Act. Proper disposal requires utilizing authorized channels.

### Authorized Channels in Sri Lanka
- **CEA-Licensed Collectors**: Private firms like Green Link (Pvt) Ltd or Cleantech authorized to collect, transport, and export hazardous e-waste.
- **Telecom Take-Back Programs**: Dialogue and Mobitel customer service centers often house bins for small e-waste (chargers, batteries, old phones).
- **University E-Waste Drives**: Student-led campaigns to aggregate waste for official disposal.

Undergraduates should lead these efforts, using their position to coordinate collection programs within their departments."""
    },
    "e_waste/environmental_impact.md": {
        "title": "Ecological Damage of Landfill Tech",
        "category": "e_waste",
        "research_factor": "environmental_concern",
        "source_type": "Research Paper",
        "source": "Environmental Science & Technology Journal",
        "keywords": "leaching, water table, lead poisoning, soil degradation",
        "content": """# Ecological Damage of Landfill Tech

When electronics are dumped in general landfills, they decompose under rain and heat, leading to severe chemical contamination.

### Environmental Mechanisms
- **Acidic Leaching**: Rainwater reacts with decomposing trash, forming acidic leachate that dissolves heavy metals (lead, cadmium) from solder and casings.
- **Bioaccumulation**: Heavy metals wash into nearby streams, enter the food chain, and concentrate in fish, crops, and humans.
- **Soil Sterilization**: High concentrations of copper and zinc from electronics kill beneficial soil microbes, reducing agricultural fertility.

Awareness of these impacts increases the environmental concern of consumers, urging them to check vendor recycling policies before purchasing hardware."""
    },
    "e_waste/circular_electronics.md": {
        "title": "Circular Electronics and Extended Producer Responsibility",
        "category": "e_waste",
        "research_factor": "perceived_benefits",
        "source_type": "Research Paper",
        "source": "World Economic Forum e-waste updates",
        "keywords": "EPR, producer responsibility, circular electronics, hardware return",
        "content": """# Circular Electronics and Extended Producer Responsibility

Extended Producer Responsibility (EPR) is a policy approach where manufacturers remain financially and physically responsible for their products at end-of-life.

### Benefits of EPR
- **Design for Recycling**: Manufacturers build laptops that are easier to open and sort because they will eventually have to pay to recycle them.
- **Reduced E-waste Volumes**: Offering trade-in discounts incentivizes users to return old devices instead of storing or throwing them away.
- **Supply Security**: Reclaiming gold and rare earth elements from old phones reduces dependency on volatile raw mineral markets.

Buying from brands that support EPR initiatives ensures that devices are processed responsibly at the end of their lifecycle."""
    },

    # 3. Green Purchase Intention (10 articles)
    "green_purchase_intention/environmental_knowledge.md": {
        "title": "Environmental Knowledge and Intention",
        "category": "green_purchase_intention",
        "research_factor": "environmental_knowledge",
        "source_type": "Research Paper",
        "source": "Journal of Environmental Education",
        "keywords": "eco-literacy, energy ratings, green variables, purchase intention",
        "content": """# Environmental Knowledge and Intention

Environmental knowledge represents an individual's understanding of environmental issues, eco-labels, and the ecological impacts of consumer choices.

### Impact on Purchase Decisions
- **Lowering Information Barriers**: Knowing what certifications (like EPEAT or RoHS) mean helps students identify genuine green products.
- **Understanding Life-Cycle Costs**: Knowledge allows students to evaluate energy cost savings over the lifespan of a device, rather than focusing solely on the upfront purchase price.
- **Curriculum Integration**: Integrating green IT concepts into university curricula directly enhances the environmental knowledge of IT undergraduates.

Higher knowledge levels empower students to translate their intentions into actual green purchases."""
    },
    "green_purchase_intention/environmental_concern.md": {
        "title": "Environmental Concern and Purchase Intention",
        "category": "green_purchase_intention",
        "research_factor": "environmental_concern",
        "source_type": "Research Paper",
        "source": "International Journal of Consumer Studies",
        "keywords": "climate concern, attitude-behavior gap, eco-responsibility, purchase motive",
        "content": """# Environmental Concern and Purchase Intention

Environmental concern is defined as a general worry about environmental health, resource depletion, and climate change.

### Role in Green Intention
- **Motivational Driver**: High environmental concern acts as the primary emotional catalyst for seeking green products.
- **The Attitude-Behavior Gap**: Although many students report high levels of environmental concern, economic constraints and lack of product availability often prevent them from purchasing green electronics.
- **Increasing Concern**: Educational campaigns and visibility of local pollution issues (like urban e-waste dumping) help increase environmental concern.

While concern is necessary, it must be paired with knowledge and accessibility to successfully influence purchase behavior."""
    },
    "green_purchase_intention/perceived_value.md": {
        "title": "Perceived Value of Sustainable Hardware",
        "category": "green_purchase_intention",
        "research_factor": "perceived_benefits",
        "source_type": "Research Paper",
        "source": "Journal of Cleaner Production Research",
        "keywords": "green value, functional value, cost utility, energy savings",
        "content": """# Perceived Value of Sustainable Hardware

Perceived value is a consumer's overall assessment of the utility of a product, balancing perceived benefits against cost.

### Dimensions of Green Value
1. **Functional Value**: The processing speed, battery life, and durability of the device.
2. **Economic Value**: Long-term savings from energy-efficient operations and modular upgrades.
3. **Emotional/Social Value**: The satisfaction of making an eco-responsible choice and the positive reputation associated with it.

If consumers believe green electronics offer superior build quality and lower operating costs, their purchase intention increases significantly."""
    },
    "green_purchase_intention/purchase_barriers.md": {
        "title": "Economic and Market Purchase Barriers",
        "category": "green_purchase_intention",
        "research_factor": "perceived_barriers",
        "source_type": "Research Paper",
        "source": "Asia Pacific Journal of Marketing and Logistics",
        "keywords": "price premium, import duties, market availability, economic barrier",
        "content": """# Economic and Market Purchase Barriers

Perceived barriers are hurdles that prevent consumers from translating positive environmental attitudes into purchases.

### Common Barriers in Sri Lanka
- **High Green Premium**: Eco-certified laptops often cost more upfront than entry-level, non-certified options.
- **Import Tariffs**: Heavy taxes on high-end tech increase the price of eco-labeled devices, which are often categorized as luxury imports.
- **Information Deficit**: Lack of retail signage and staff training on eco-certifications in local computer stores.

Addressing these barriers through targeted subsidies and retail awareness campaigns is crucial to fostering green purchase intention among students."""
    },
    "green_purchase_intention/consumer_behavior.md": {
        "title": "The Theory of Planned Behavior in Green IT",
        "category": "green_purchase_intention",
        "research_factor": "green_purchase_intention",
        "source_type": "Research Paper",
        "source": "Journal of Business Research",
        "keywords": "TPB model, attitude, subjective norm, behavioral control, intention",
        "content": """# Theory of Planned Behavior in Green IT

The Theory of Planned Behavior (TPB) is a key theoretical framework used to analyze consumer green purchase intentions.

### Core Variables of the TPB
1. **Attitude toward the Behavior**: An individual's positive or negative evaluation of purchasing a green device.
2. **Subjective Norms**: Social pressure from peers, family, and university mentors to choose eco-friendly hardware.
3. **Perceived Behavioral Control**: The perceived ease or difficulty of making the purchase (influenced by budget and product availability).

These factors combine to shape an individual's green purchase intention, which is the direct antecedent to actual purchase behavior."""
    },
    "green_purchase_intention/social_influence.md": {
        "title": "Social Influence and Peer Expectations",
        "category": "green_purchase_intention",
        "research_factor": "social_influence",
        "source_type": "Research Paper",
        "source": "Journal of Applied Social Psychology",
        "keywords": "peer pressure, subjective norms, university community, social pressure",
        "content": """# Social Influence and Peer Expectations

Social influence represents the impact of peers, lecturers, and university leadership on a student's procurement choices.

### Key Factors
- **Peer Behavior**: Seeing colleagues choose modular or refurbished laptops normalized the behavior within computing departments.
- **Institutional Advocacy**: University policies that prioritize green guidelines in procurement influence student choices.
- **Social Recognition**: The prestige associated with using sustainable tech in group projects or labs.

Fostering a campus culture of sustainability is a highly effective way to leverage social influence and drive purchase intentions."""
    },
    "green_purchase_intention/willingness_to_pay.md": {
        "title": "Willingness to Pay Green Premiums",
        "category": "green_purchase_intention",
        "research_factor": "perceived_barriers",
        "source_type": "Research Paper",
        "source": "Ecological Economics Journal",
        "keywords": "green premium, price elasticity, student budget, cost trade-off",
        "content": """# Willingness to Pay Green Premiums

Willingness to pay (WTP) refers to the maximum premium a consumer is willing to pay for an eco-labeled product over a standard alternative.

### Context for Sri Lankan Undergraduates
- **Limited Income**: Most state university students rely on Mahapola scholarships or parental support, making them highly price-sensitive.
- **Value Realization**: Students are more willing to pay a premium if they understand that energy savings and upgrade options will offset the initial cost.
- **Financing Barriers**: Lack of student loan systems or installment plans for electronics restricts their ability to afford higher-quality green hardware.

Understanding WTP helps manufacturers price eco-labeled options appropriately for developing markets."""
    },
    "green_purchase_intention/availability_gap.md": {
        "title": "The Tech Availability Gap in Local Markets",
        "category": "green_purchase_intention",
        "research_factor": "perceived_barriers",
        "source_type": "Research Paper",
        "source": "Journal of Cleaner Production - Sri Lanka studies",
        "keywords": "supply chain, retail availability, eco-hardware access, import market",
        "content": """# The Tech Availability Gap in Local Markets

Even when students have high environmental concern and knowledge, they are often unable to buy green products due to limited local availability.

### Key Challenges in Sri Lanka
- **Stock Depletion**: Local importers prioritize high-turnover, budget-friendly devices, which rarely carry advanced eco-certifications.
- **Geographic Disparity**: Specialized eco-labeled hardware is typically only found in major retail hubs like Colombo, leaving regional university students underserved.
- **Custom Orders**: Ordering green hardware from international platforms incurs high shipping costs and import delays.

Improving the local supply chain for sustainable tech is essential to bridging this availability gap."""
    },
    "green_purchase_intention/attitude_behavior_gap.md": {
        "title": "Deconstructing the Attitude-Behavior Gap",
        "category": "green_purchase_intention",
        "research_factor": "green_purchase_intention",
        "source_type": "Research Paper",
        "source": "Environmental Communication Journal",
        "keywords": "attitude-behavior, green gap, intention discrepancy, purchasing constraints",
        "content": """# Deconstructing the Attitude-Behavior Gap

The attitude-behavior gap refers to the discrepancy between a consumer's expressed environmental attitudes and their actual purchasing behavior.

### Contributing Factors
- **Economic Constraints**: Environmental values are often set aside when students face immediate budget limits.
- **Convenience vs. Care**: Standard electronics are widely available and easy to purchase compared to searching for eco-labeled options.
- **Cynicism**: Skepticism regarding manufacturer claims of green practices can lead students to dismiss eco-labels.

Addressing this gap requires making green options more affordable, visible, and convenient for consumers."""
    },
    "green_purchase_intention/curriculum_role.md": {
        "title": "The Impact of Academic IT Curricula",
        "category": "green_purchase_intention",
        "research_factor": "environmental_knowledge",
        "source_type": "Research Paper",
        "source": "IEEE Transactions on Education",
        "keywords": "education impact, green IT curriculum, university training, student knowledge",
        "content": """# The Impact of Academic IT Curricula

Integrating green IT and sustainable engineering principles into university curricula is highly effective in driving environmental awareness.

### Educational Methods
- **Green Computing Modules**: Courses covering processor energy management, hardware lifecycle analysis, and sustainable software design.
- **Hands-on Labs**: Disassembling devices to analyze repairability scores and component materials.
- **Research Projects**: Encouraging undergraduate theses on e-waste management and green consumer behavior.

Academic exposure provides students with the practical knowledge needed to make sustainable purchasing decisions throughout their careers."""
    },

    # 4. Device Recommendations (5 articles)
    "electronic_devices/laptops.md": {
        "title": "Evaluating Sustainable Laptop Options",
        "category": "electronic_devices",
        "research_factor": "green_product_awareness",
        "source_type": "Manufacturer Sustainability Report",
        "source": "Greenpeace Green Electronics Guide",
        "keywords": "sustainable laptop, repair score, aluminum build, carbon footprint",
        "content": """# Evaluating Sustainable Laptop Options

When selecting a laptop, students should evaluate both specifications and environmental footprints.

### Key Sustainability Criteria
- **Aluminum Chassis**: Aluminum is highly recyclable and more durable than plastic, extending the device's physical lifespan.
- **EPEAT Gold Status**: Indicates the laptop meets rigorous environmental criteria, including material selection, energy use, and end-of-life design.
- **High iFixit Repair Score**: Laptops with scores of 8/10 or higher are designed for easy disassembly and component replacement.

Choosing sustainable laptops reduces overall resource extraction and e-waste generation."""
    },
    "electronic_devices/smartphones.md": {
        "title": "Eco-Friendly Smartphones and Lifespans",
        "category": "electronic_devices",
        "research_factor": "green_product_awareness",
        "source_type": "Manufacturer Sustainability Report",
        "source": "Fairphone Annual Impact Report",
        "keywords": "fairphone, modular smartphone, battery replacement, conflict minerals",
        "content": """# Eco-Friendly Smartphones and Lifespans

Smartphones have short lifecycles and low recycling rates. Choosing sustainable models is crucial to mitigating their environmental impact.

### Sustainable Smartphone Features
- **Modular Components**: Devices with replaceable screens, batteries, and camera modules that can be swapped using basic tools.
- **Fair-Trade Sourcing**: Guaranteeing fair wages for miners extracting raw minerals like cobalt and tin.
- **Extended Software Support**: Providing security patches and OS updates for 5-7 years to prevent premature obsolescence.

Selecting modular smartphones helps reduce the frequency of device replacements and the associated e-waste."""
    },
    "electronic_devices/refurbished_devices.md": {
        "title": "The Benefits of Refurbished Tech",
        "category": "electronic_devices",
        "research_factor": "perceived_benefits",
        "source_type": "Government Guideline",
        "source": "EPA Refurbished Electronics Procurement Guide",
        "keywords": "refurbished laptop, used hardware, cost reduction, carbon avoidance",
        "content": """# The Benefits of Refurbished Tech

Refurbished enterprise-grade laptops represent an excellent option for budget-conscious students seeking sustainable hardware.

### Key Benefits
- **Cost Reduction**: Enterprise-grade business laptops (like ThinkPads or Latitudes) are often available at 40-60% off original retail prices.
- **High Build Quality**: Business-class laptops feature durable carbon fiber or magnesium alloy chassis designed to last for years.
- **Carbon Avoidance**: Buying refurbished completely avoids the environmental impact of manufacturing a new device.

For university students, refurbished hardware is a highly practical way to balance budget constraints with environmental concern."""
    },
    "electronic_devices/accessories.md": {
        "title": "Eco-Friendly Peripheral Options",
        "category": "electronic_devices",
        "research_factor": "green_product_awareness",
        "source_type": "Manufacturer Sustainability Report",
        "source": "WEEE recycling standards",
        "keywords": "recycled mouse, hemp cables, wireless power, plastic-free accessories",
        "content": """# Eco-Friendly Peripheral Options

Selecting sustainable accessories helps further reduce your overall environmental footprint.

### Eco-Friendly Peripheral Features
- **Ocean-Bound Plastics**: Mice and keyboard housings manufactured using plastics reclaimed from coastal waterways.
- **Biodegradable Laptop Sleeves**: Cases made from organic materials like cork, hemp, or felt instead of synthetic neoprene.
- **Rechargeable Batteries**: Choosing accessories with built-in rechargeable batteries to avoid single-use cells.

These small choices contribute to a more comprehensive approach to sustainable technology use."""
    },
    "electronic_devices/green_monitors.md": {
        "title": "Energy Consumption of Display Panels",
        "category": "electronic_devices",
        "research_factor": "perceived_benefits",
        "source_type": "Government Guideline",
        "source": "Energy Star Display Specification",
        "keywords": "display energy, IPS panel, eco-mode, brightness carbon",
        "content": """# Energy Consumption of Display Panels

Computer monitors consume significant power, and selecting energy-efficient models can help reduce overall electricity costs.

### Efficiency Factors
- **Eco-Modes**: Features that adjust backlighting automatically based on ambient light levels.
- **LED/OLED Technology**: High-efficiency panels that consume up to 40% less power than older LCD designs.
- **Auto-Off Timers**: Configuring displays to enter low-power sleep states after periods of inactivity.

Choosing energy-efficient displays is key to minimizing the environmental impact of desktop workstations."""
    },
    "research_background/TPB_model.md": {
        "title": "The Theory of Planned Behavior Model",
        "category": "research_background",
        "research_factor": "green_purchase_intention",
        "source_type": "Research Paper",
        "source": "Ajzen, I. (1991). The Theory of Planned Behavior.",
        "keywords": "tpb, behavior intention, subjective norm, perceived control",
        "content": """# The Theory of Planned Behavior Model

The Theory of Planned Behavior (TPB), developed by Icek Ajzen, is the foundational framework for this research project. It posits that individual behavior is driven by behavioral intentions, which are in turn influenced by three constructs.

### Core Constructs of TPB
1. **Attitude**: The degree to which a person has a favorable or unfavorable evaluation of the behavior in question (e.g., buying green electronics).
2. **Subjective Norm**: The perceived social pressure to perform or not perform the behavior, shaped by the expectations of peers, lecturers, and family.
3. **Perceived Behavioral Control**: The perceived ease or difficulty of performing the behavior, which reflects past experiences as well as anticipated obstacles (e.g., high prices, lack of availability).

By analyzing how these factors interact among IT undergraduates in Sri Lankan state universities, this study aims to explain what drives or hinders sustainable device purchase decisions."""
    },
    "research_background/sustainable_consumption.md": {
        "title": "Sustainable Consumption of IT Hardware",
        "category": "research_background",
        "research_factor": "environmental_knowledge",
        "source_type": "Environmental Organization",
        "source": "Sustainable Development Goals (SDG 12)",
        "keywords": "sdg 12, sustainable consumption, hardware footprint, resource conservation",
        "content": """# Sustainable Consumption of IT Hardware

Sustainable consumption is about doing more and better with less. It is closely linked to United Nations Sustainable Development Goal 12 (Responsible Consumption and Production).

### Application to IT Procurement
- **Dematerialization**: Moving from physical servers to high-efficiency virtual cloud environments.
- **Eco-Efficiency**: Maximizing output per unit of energy or resource consumed.
- **Resource Conservation**: Extending device lifespans to reduce raw mining for gold, copper, and rare earth metals.

Promoting sustainable consumption within state universities helps ensure that future IT professionals design and manage technology infrastructures with minimal ecological footprints."""
    },
    "research_background/green_consumer_behavior.md": {
        "title": "Understanding Green Consumer Behavior",
        "category": "research_background",
        "research_factor": "green_purchase_intention",
        "source_type": "Research Paper",
        "source": "Journal of Consumer Policy",
        "keywords": "consumer habits, eco-products, green purchase, market dynamics",
        "content": """# Understanding Green Consumer Behavior

Green consumer behavior refers to purchasing choices that minimize environmental harm throughout the product lifecycle.

### Key Factors and Challenges
- **Cognitive Dissonance**: Consumers often experience conflict when their eco-friendly beliefs clash with their budgets.
- **Greenwashing**: Confusing or deceptive marketing claims that exaggerate a product's environmental benefits.
- **Developing Country Context**: In nations like Sri Lanka, economic instability, high inflation, and import constraints often override environmental values.

Developing a deep understanding of these market dynamics helps researchers and policymakers craft effective initiatives to support green product adoption."""
    }
}

def generate():
    # Base directory paths
    base_dir = "/Users/sewminikangara/Documents/Cbot/backend/knowledge_base"
    print(f"Generating Knowledge Base under {base_dir}...")
    
    for filepath, details in DOCS.items():
        full_path = os.path.join(base_dir, filepath)
        dir_name = os.path.dirname(full_path)
        os.makedirs(dir_name, exist_ok=True)
        
        # Format the frontmatter markdown content
        file_content = f"""---
title: "{details['title']}"
category: "{details['category']}"
research_factor: "{details['research_factor']}"
source_type: "{details['source_type']}"
source: "{details['source']}"
keywords: [{', '.join([f'"{k.strip()}"' for k in details['keywords'].split(',')])}]
---

{details['content'].strip()}
"""
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(file_content)
        print(f"Created: {filepath}")

if __name__ == "__main__":
    generate()
